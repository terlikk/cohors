"""
PrintFlow — Slicing Worker
Pobiera modele STL/3MF z kolejki, slicuje przez PrusaSlicer CLI,
zwraca GCode + estymaty (czas, materiał, warstwy).
"""

import json
import os
import re
import subprocess
import tempfile
from pathlib import Path

import redis
import boto3

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
S3_BUCKET = os.getenv("S3_BUCKET", "printflow-files")
PRUSASLICER_PATH = os.getenv("PRUSASLICER_PATH", "/usr/bin/prusa-slicer")
QUEUE_NAME = "printflow:slice"

r = redis.from_url(REDIS_URL)
s3 = boto3.client("s3")


def download_model(url: str, dest: Path) -> Path:
    """Pobierz model z S3 lub URL."""
    if url.startswith("s3://"):
        key = url.replace(f"s3://{S3_BUCKET}/", "")
        s3.download_file(S3_BUCKET, key, str(dest))
    else:
        import urllib.request
        urllib.request.urlretrieve(url, str(dest))
    return dest


def slice_model(
    model_path: Path,
    output_path: Path,
    layer_height: float = 0.2,
    infill: int = 20,
    supports: bool = False,
    printer_profile: str = "default",
) -> dict:
    """Uruchom PrusaSlicer CLI i zwróć estymaty."""
    cmd = [
        PRUSASLICER_PATH,
        "--export-gcode",
        "--layer-height", str(layer_height),
        "--fill-density", f"{infill}%",
        "--output", str(output_path),
        str(model_path),
    ]

    if supports:
        cmd.extend(["--support-material"])

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)

    if result.returncode != 0:
        raise RuntimeError(f"PrusaSlicer error: {result.stderr}")

    # Parsuj estymaty z GCode komentarzy
    estimates = parse_gcode_estimates(output_path)
    return estimates


def parse_gcode_estimates(gcode_path: Path) -> dict:
    """Wyciągnij estymaty z komentarzy w GCode (PrusaSlicer format)."""
    estimates = {
        "estimated_minutes": 0,
        "estimated_grams": 0,
        "layer_count": 0,
        "filament_length_mm": 0,
    }

    with open(gcode_path, "r") as f:
        for line in f:
            if line.startswith("; estimated printing time"):
                # ; estimated printing time (normal mode) = 1h 23m 45s
                time_match = re.search(r"(\d+)h\s*(\d+)m\s*(\d+)s", line)
                if time_match:
                    h, m, s = map(int, time_match.groups())
                    estimates["estimated_minutes"] = h * 60 + m + s / 60

            elif line.startswith("; filament used [mm]"):
                match = re.search(r"= ([\d.]+)", line)
                if match:
                    estimates["filament_length_mm"] = float(match.group(1))

            elif line.startswith("; filament used [g]"):
                match = re.search(r"= ([\d.]+)", line)
                if match:
                    estimates["estimated_grams"] = float(match.group(1))

            elif line.startswith("; total layers count"):
                match = re.search(r"= (\d+)", line)
                if match:
                    estimates["layer_count"] = int(match.group(1))

    return estimates


def upload_gcode(local_path: Path, job_id: str) -> str:
    """Upload GCode do S3."""
    key = f"gcode/{job_id}.gcode"
    s3.upload_file(str(local_path), S3_BUCKET, key)
    return f"s3://{S3_BUCKET}/{key}"


def process_job(job_data: dict):
    """Przetwórz jedno zlecenie slicingu."""
    job_id = job_data["job_id"]
    model_url = job_data["model_url"]
    params = job_data.get("params", {})

    print(f"[SLICER] Processing job {job_id}...")

    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir = Path(tmpdir)
        model_ext = Path(model_url).suffix or ".stl"
        model_path = tmpdir / f"model{model_ext}"
        gcode_path = tmpdir / "output.gcode"

        # 1. Pobierz model
        download_model(model_url, model_path)

        # 2. Slicuj
        estimates = slice_model(
            model_path=model_path,
            output_path=gcode_path,
            layer_height=params.get("layer_height", 0.2),
            infill=params.get("infill", 20),
            supports=params.get("supports", False),
            printer_profile=params.get("printer_profile", "default"),
        )

        # 3. Upload GCode
        gcode_url = upload_gcode(gcode_path, job_id)

        # 4. Zwróć wynik
        result = {
            "job_id": job_id,
            "gcode_url": gcode_url,
            **estimates,
        }

        r.publish(f"printflow:slice:result:{job_id}", json.dumps(result))
        print(f"[SLICER] Job {job_id} done: {estimates}")


def main():
    """Main loop — czekaj na zlecenia z Redis."""
    print("[SLICER] Worker started, waiting for jobs...")

    while True:
        # BRPOP — blocking pop z kolejki
        _, raw = r.brpop(QUEUE_NAME)
        job_data = json.loads(raw)

        try:
            process_job(job_data)
        except Exception as e:
            print(f"[SLICER] Error processing job: {e}")
            error_data = {
                "job_id": job_data.get("job_id"),
                "error": str(e),
            }
            r.publish(
                f"printflow:slice:result:{job_data.get('job_id')}",
                json.dumps(error_data),
            )


if __name__ == "__main__":
    main()
