"""
PrintFlow Slicer API
Accepts STL/OBJ/STEP files, runs PrusaSlicer, returns real print data.
"""
import os, re, subprocess, tempfile, json
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["https://printflow-seven.vercel.app", "http://localhost:3000"])

PRUSASLICER = os.getenv("PRUSASLICER_PATH", "/usr/local/bin/prusa-slicer")
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

# Material presets
MATERIAL_TEMPS = {
    "PLA":   {"bed": 60,  "nozzle": 215},
    "PETG":  {"bed": 80,  "nozzle": 240},
    "ABS":   {"bed": 100, "nozzle": 250},
    "TPU":   {"bed": 50,  "nozzle": 230},
    "ASA":   {"bed": 100, "nozzle": 260},
    "Nylon": {"bed": 80,  "nozzle": 260},
}

def parse_gcode(gcode_path: str) -> dict:
    """Extract real stats from generated G-code."""
    result = {
        "estimated_minutes": 0,
        "estimated_grams": 0,
        "filament_length_mm": 0,
        "layer_count": 0,
        "filament_cost": 0,
    }
    try:
        with open(gcode_path) as f:
            for line in f:
                if line.startswith("; estimated printing time"):
                    # Format: ; estimated printing time (normal mode) = 1h 23m 45s
                    m = re.search(r"(?:(\d+)d\s*)?(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?", line.split("=")[-1])
                    if m:
                        d = int(m.group(1) or 0)
                        h = int(m.group(2) or 0)
                        mn = int(m.group(3) or 0)
                        s = int(m.group(4) or 0)
                        result["estimated_minutes"] = d * 1440 + h * 60 + mn + s / 60
                elif line.startswith("; filament used [mm]"):
                    m = re.search(r"= ([\d.]+)", line)
                    if m:
                        result["filament_length_mm"] = float(m.group(1))
                elif line.startswith("; filament used [g]"):
                    m = re.search(r"= ([\d.]+)", line)
                    if m:
                        result["estimated_grams"] = float(m.group(1))
                elif line.startswith("; filament used [cm3]"):
                    m = re.search(r"= ([\d.]+)", line)
                    if m:
                        result["filament_cm3"] = float(m.group(1))
                elif line.startswith("; total layers count"):
                    m = re.search(r"= (\d+)", line)
                    if m:
                        result["layer_count"] = int(m.group(1))
                elif line.startswith("; filament cost"):
                    m = re.search(r"= ([\d.]+)", line)
                    if m:
                        result["filament_cost"] = float(m.group(1))
    except Exception:
        pass
    
    result["estimated_hours"] = round(result["estimated_minutes"] / 60, 2)
    result["filament_meters"] = round(result["filament_length_mm"] / 1000, 2)
    return result


@app.route("/health", methods=["GET"])
def health():
    # Check PrusaSlicer is available
    try:
        r = subprocess.run([PRUSASLICER, "--version"], capture_output=True, text=True, timeout=10)
        version = r.stdout.strip() or r.stderr.strip()
        return jsonify({"status": "ok", "prusaslicer": version})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/slice", methods=["POST"])
def slice_file():
    """
    Upload a 3D file and get real slicing data.
    
    Form fields:
    - file: the 3D model file (STL, OBJ, STEP, STP, 3MF)
    - material: PLA, PETG, ABS, TPU, ASA, Nylon (default: PLA)
    - quality: draft, standard, high (default: standard)
    - infill: 0-100 (default: 30)
    - supports: true/false (default: false)
    """
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    f = request.files["file"]
    if not f.filename:
        return jsonify({"error": "Empty filename"}), 400
    
    ext = f.filename.rsplit(".", 1)[-1].lower() if "." in f.filename else ""
    if ext not in ("stl", "obj", "step", "stp", "3mf"):
        return jsonify({"error": f"Unsupported format: .{ext}"}), 400

    material = request.form.get("material", "PLA").upper()
    quality = request.form.get("quality", "standard").lower()
    infill = int(request.form.get("infill", "30"))
    supports = request.form.get("supports", "false").lower() == "true"

    # Layer height from quality
    layer_heights = {"draft": 0.3, "standard": 0.2, "high": 0.12}
    layer_height = layer_heights.get(quality, 0.2)

    # Speed based on quality  
    speeds = {"draft": 150, "standard": 100, "high": 60}
    speed = speeds.get(quality, 100)

    with tempfile.TemporaryDirectory() as tmpdir:
        model_path = os.path.join(tmpdir, f"model.{ext}")
        gcode_path = os.path.join(tmpdir, "output.gcode")
        
        f.save(model_path)
        
        file_size = os.path.getsize(model_path)
        if file_size > MAX_FILE_SIZE:
            return jsonify({"error": "File too large (max 100MB)"}), 400

        # Build PrusaSlicer command
        cmd = [
            PRUSASLICER,
            "--export-gcode",
            "--layer-height", str(layer_height),
            "--fill-density", f"{infill}%",
            "--perimeters", "3",
            "--top-solid-layers", "4",
            "--bottom-solid-layers", "4",
            "--infill-speed", str(speed),
            "--perimeter-speed", str(int(speed * 0.8)),
            "--nozzle-diameter", "0.4",
            "--filament-diameter", "1.75",
            "--output", gcode_path,
            model_path,
        ]

        temps = MATERIAL_TEMPS.get(material, MATERIAL_TEMPS["PLA"])
        cmd.extend(["--bed-temperature", str(temps["bed"])])
        cmd.extend(["--temperature", str(temps["nozzle"])])

        if supports:
            cmd.append("--support-material")

        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        except subprocess.TimeoutExpired:
            return jsonify({"error": "Slicing timeout (>5min)"}), 504
        
        if result.returncode != 0:
            return jsonify({
                "error": "Slicing failed",
                "stderr": result.stderr[:500],
            }), 500

        if not os.path.exists(gcode_path):
            return jsonify({"error": "No G-code output generated"}), 500

        stats = parse_gcode(gcode_path)
        gcode_size = os.path.getsize(gcode_path)

        return jsonify({
            "success": True,
            "filename": f.filename,
            "material": material,
            "quality": quality,
            "layer_height_mm": layer_height,
            "infill_percent": infill,
            "supports": supports,
            "gcode_size_bytes": gcode_size,
            **stats,
        })


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8080"))
    app.run(host="0.0.0.0", port=port, debug=False)
