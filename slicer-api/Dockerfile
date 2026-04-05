FROM python:3.11-slim

# Install PrusaSlicer
RUN apt-get update && apt-get install -y \
    wget libgl1 libglib2.0-0 libgtk-3-0 libx11-6 \
    && rm -rf /var/lib/apt/lists/*

# Download PrusaSlicer AppImage and extract
RUN wget -q "https://github.com/prusa3d/PrusaSlicer/releases/download/version_2.7.4/PrusaSlicer-2.7.4+linux-x64-GTK3-202404050928.AppImage" -O /tmp/prusaslicer.AppImage \
    && chmod +x /tmp/prusaslicer.AppImage \
    && cd /tmp && ./prusaslicer.AppImage --appimage-extract \
    && mv /tmp/squashfs-root /opt/prusaslicer \
    && ln -s /opt/prusaslicer/AppRun /usr/local/bin/prusa-slicer \
    && rm /tmp/prusaslicer.AppImage

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server.py .

EXPOSE 8080
CMD ["python", "server.py"]
