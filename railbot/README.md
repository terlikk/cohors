# RailBot — Automatyczny robot wymiany płyt dla farmy drukarek 3D

## Koncept
Robot jeżdżący po szynie (V-slot) zamontowanej na froncie farmy drukarek.
Po zakończeniu wydruku: wyciąga płytę → odkłada do strefy odbioru → pobiera czystą → wkłada do drukarki.

## Struktura projektu
- `firmware/` — kod ESP32 (PlatformIO)
- `electronics/` — schematy, pinout, BOM
- `cad/` — wymiary i instrukcje do Fusion 360
- `docs/` — dokumentacja montażu
