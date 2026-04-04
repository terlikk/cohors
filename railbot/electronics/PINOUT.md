# RailBot — Schemat połączeń ESP32-S3

## Pinout ESP32-S3 → Peryferia

```
ESP32-S3 DevKit
┌─────────────────────┐
│                     │
│  GPIO 1  ──────────── TMC2209 #1 (oś X) - STEP
│  GPIO 2  ──────────── TMC2209 #1 (oś X) - DIR
│  GPIO 3  ──────────── TMC2209 #1 (oś X) - EN
│  GPIO 4  ──────────── TMC2209 #1 (oś X) - UART TX/RX (single wire)
│                     │
│  GPIO 5  ──────────── TMC2209 #2 (oś Y) - STEP
│  GPIO 6  ──────────── TMC2209 #2 (oś Y) - DIR
│  GPIO 7  ──────────── TMC2209 #2 (oś Y) - EN
│  GPIO 8  ──────────── TMC2209 #2 (oś Y) - UART TX/RX
│                     │
│  GPIO 9  ──────────── Servo MG996R (oś Z) - SIGNAL
│                     │
│  GPIO 10 ──────────── Endstop X MIN (krańcówka lewa)
│  GPIO 11 ──────────── Endstop X MAX (krańcówka prawa)
│  GPIO 12 ──────────── Endstop Y MIN (widełki wciągnięte)
│  GPIO 13 ──────────── Endstop Y MAX (widełki wysunięte)
│                     │
│  GPIO 14 ──────────── Hall Sensor stacja 1 (drukarka 1)
│  GPIO 15 ──────────── Hall Sensor stacja 2 (drukarka 2)
│  GPIO 16 ──────────── Hall Sensor stacja 3 (drukarka 3)
│  GPIO 17 ──────────── Hall Sensor stacja 4 (drukarka 4)
│                     │
│  GPIO 18 ──────────── Optyczny czujnik płyty (na widełkach)
│  GPIO 19 ──────────── Optyczny czujnik rack pełny/pusty
│                     │
│  GPIO 20 ──────────── Status LED (WS2812B) - opcjonalnie
│                     │
│  GND ──────────────── Wspólna masa
│  5V  ──────────────── Z buck convertera 24V→5V
│                     │
└─────────────────────┘
```

## TMC2209 — Połączenia szczegółowe

```
TMC2209 #1 (Oś X - ruch po szynie)
┌──────────────────┐
│ VCC   ← 24V     │  (zasilacz)
│ GND   ← GND     │  (wspólna masa)
│ STEP  ← GPIO 1  │
│ DIR   ← GPIO 2  │
│ EN    ← GPIO 3  │  (LOW = enabled)
│ UART  ← GPIO 4  │  (przez 1kΩ rezystor)
│ MS1   ← GND     │  (UART mode: oba LOW)
│ MS2   ← GND     │
│ VM    ← 24V     │  (zasilanie silnika)
│ OA1   → NEMA17  │  (cewka A+)
│ OA2   → NEMA17  │  (cewka A-)
│ OB1   → NEMA17  │  (cewka B+)
│ OB2   → NEMA17  │  (cewka B-)
│ VREF  ← potencjometr │ (ustawić na ~0.8V dla 1A)
└──────────────────┘

TMC2209 #2 (Oś Y - widełki) — identycznie, GPIO 5-8
```

## Servo (Oś Z - podnoszenie)

```
MG996R Servo
┌──────────┐
│ Signal ← GPIO 9  │  (PWM, 50Hz)
│ VCC    ← 5V      │  (z buck convertera, osobna linia!)
│ GND    ← GND     │
└──────────┘

Pozycje:
- 0°   = opuszczone (płyta leży na łożu)
- 15°  = podniesione (płyta oderwana od magnesu)
```

## Zasilanie

```
Zasilacz 24V 5A
    │
    ├──→ TMC2209 #1 VM (silnik X)
    ├──→ TMC2209 #1 VCC (logika)
    ├──→ TMC2209 #2 VM (silnik Y)
    ├──→ TMC2209 #2 VCC (logika)
    │
    └──→ Buck Converter LM2596 (24V → 5V)
              │
              ├──→ ESP32-S3 5V pin
              ├──→ Servo MG996R VCC
              └──→ Czujniki VCC
```

## Endstopy (mikroswitche)

```
Każdy endstop:
    COM ──→ GPIO (z wewnętrznym pullup)
    NO  ──→ GND
    
Wciśnięty = LOW (triggered)
Normalnie = HIGH (pullup)
```

## Czujniki Halla (SS49E)

```
Każdy czujnik:
    VCC ──→ 5V
    GND ──→ GND
    OUT ──→ GPIO (analogowy odczyt, ale użyjemy jako digital z progiem)
    
Magnes w szynie → czujnik na wózku = LOW (stacja znaleziona)
```

## WAŻNE uwagi
- **UART TMC2209**: użyj 1kΩ rezystor między TX a RX (single wire UART)
- **Servo na osobnej linii 5V**: servo ciągnie dużo prądu, nie podłączaj z ESP na jednej linii
- **Kondensatory**: 100µF na linii 24V przy TMC2209, 470µF na linii 5V
- **Masa wspólna**: wszystkie GND połączone razem
