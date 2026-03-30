"""
PrintFlow — Slicing Worker
Pobiera STL/3MF z kolejki, slicuje przez PrusaSlicer CLI,
zwraca GCode + estymaty (czas, materiał, warstwy).
"""
import json, os, re, subprocess, tempfile
from pathlib import Path
import redis, boto3

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
S3_BUCKET = os.getenv("S3_BUCKET", "printflow-files")
PRUSASLICER_PATH = os.getenv("PRUSASLICER_PATH", "/usr/bin/prusa-slicer")
QUEUE_NAME = "printflow:slice"

r = redis.from_url(REDIS_URL)
s3 = boto3.client("s3")

def download_model(url: str, dest: Path) -> Path:
    if url.startswith("s3://"):
        key = url.replace(f"s3://{S3_BUCKET}/", "")
        s3.download_file(S3_BUCKET, key, str(dest))
    else:
        import urllib.request
        urllib.request.urlretrieve(url, str(dest))
    return dest

def slice_model(model_path, output_path, layer_height=0.2, infill=20, supports=False, printer_profile="default"):
    cmd = [PRUSASLICER_PATH, "--export-gcode",
           "--layer-height", str(layer_height),
           "--fill-density", f"{infill}%",
           "--output", str(output_path), str(model_path)]
    if supports:
        cmd.extend(["--support-material"])
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if result.returncode != 0:
        raise RuntimeError(f"PrusaSlicer error: {result.stderr}")
    return parse_gcode_estimates(output_path)

def parse_gcode_estimates(gcode_path):
    estimates = {"estimated_minutes": 0, "estimated_grams": 0,
                 "layer_count": 0, "filament_length_mm": 0}
    with open(gcode_path) as f:
        for line in f:
            if line.startswith("; estimated printing time"):
                m = re.search(r"(\d+)h\s*(\d+)m\s*(\d+)s", line)
                if m:
                    h, mn, s = map(int, m.groups())
                    estimates["estimated_minutes"] = h*60 + mn + s/60
            elif line.startswith("; filament used [mm]"):
                m = re.search(r"= ([\d.]+)", line)
                if m: estimates["filament_length_mm"] = float(m.group(1))
            elif line.startswith("; filament used [g]"):
                m = re.search(r"= ([\d.]+)", line)
                if m: estimates["estimated_grams"] = float(m.group(1))
            elif line.startswith("; total layers count"):
                m = re.search(r"= (\d+)", line)
                if m: estimates["layer_count"] = int(m.group(1))
    return estimates

def upload_gcode(local_path, job_id):
    key = f"gcode/{job_id}.gcode"
    s3.upload_file(str(local_path), S3_BUCKET, key)
    return f"s3://{S3_BUCKET}/{key}"

def process_job(job_data):
    job_id = job_data["job_id"]
    model_url = job_data["model_url"]
    params = job_data.get("params", {})
    print(f"[SLICER] Processing job {job_id}...")
    
    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir = Path(tmpdir)
        model_path = tmpdir / f"model{Path(model_url).suffix or '.stl'}"
        gcode_path = tmpdir / "output.gcode"
        download_model(model_url, model_path)
        estimates = slice_model(model_path, gcode_path,
            params.get("layer_height", 0.2), params.get("infill", 20),
            params.get("supports", False), params.get("printer_profile", "default"))
        gcode_url = upload_gcode(gcode_path, job_id)
        result = {"job_id": job_id, "gcode_url": gcode_url, **estimates}
        r.publish(f"printflow:slice:result:{job_id}", json.dumps(result))
        print(f"[SLICER] Job {job_id} done: {estimates}")

def main():
    print("[SLICER] Worker started, waiting for jobs...")
    while True:
        _, raw = r.brpop(QUEUE_NAME)
        job_data = json.loads(raw)
        try:
            process_job(job_data)
        except Exception as e:
            print(f"[SLICER] Error: {e}")
            r.publish(f"printflow:slice:result:{job_data.get('job_id')}",
                      json.dumps({"job_id": job_data.get("job_id"), "error": str(e)}))

if __name__ == "__main__":
    main()
