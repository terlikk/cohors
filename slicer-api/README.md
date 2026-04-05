# PrintFlow Slicer API

Real PrusaSlicer backend — upload STL/OBJ/STEP, get actual print time, filament usage, layer count.

## Deploy to Railway

1. Go to https://railway.app/new
2. Choose "Deploy from GitHub repo" → select `printflow` repo
3. Set root directory to `slicer-api`
4. Railway auto-detects Dockerfile
5. Deploy!

## API

### POST /slice
Upload a file with settings, get real slicing data.

```bash
curl -X POST https://your-railway-url.up.railway.app/slice \
  -F "file=@model.stl" \
  -F "material=PLA" \
  -F "quality=standard" \
  -F "infill=30"
```

Response:
```json
{
  "success": true,
  "filename": "model.stl",
  "material": "PLA",
  "quality": "standard",
  "layer_height_mm": 0.2,
  "infill_percent": 30,
  "estimated_hours": 2.35,
  "estimated_minutes": 141,
  "estimated_grams": 45.2,
  "filament_meters": 15.1,
  "layer_count": 240,
  "gcode_size_bytes": 1234567
}
```

### GET /health
Check if PrusaSlicer is working.

## Local dev
```bash
docker build -t slicer-api .
docker run -p 8080:8080 slicer-api
```
