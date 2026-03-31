# FlowPilot™ — Jak działa full automatyzacja (technicznie)

## Schemat połączeń

```
┌─────────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Strona (Vercel)   │ ←────→ │    Supabase      │ ←────→ │  PrintFlow Box  │
│   printflow.pl      │  REST   │  (baza + realtime)│  WS    │  (RPi w farmie) │
│                     │         │                  │         │                 │
│  • Klient zamawia   │         │  • orders table  │         │  • Agent soft   │
│  • Farma zarządza   │         │  • realtime sync │         │  • Slicer CLI   │
│  • Dashboard        │         │  • storage (STL) │         │  • AI model     │
└─────────────────────┘         └──────────────────┘         └────────┬────────┘
                                                                      │ LAN
                                                              ┌───────▼────────┐
                                                              │   Drukarki     │
                                                              │  Klipper API   │
                                                              │  OctoPrint API │
                                                              │  Bambu Cloud   │
                                                              │  Prusa Connect │
                                                              └────────────────┘
```

---

## Krok po kroku — co się dzieje gdy klient zamawia

### KROK 1: Klient zamawia na stronie
```
Klient → printflow.pl/upload → wrzuca STL → wybiera PLA Czarny 10 szt
       → marketplace → wybiera "3DPrint Warszawa" → klika "Zamów"
       → płaci przez Stripe
       → system tworzy w Supabase:
         INSERT INTO orders (farm_id, status, file_names, material, color, quantity, ...)
         VALUES ('farm-uuid', 'paid', ['bracket.stl'], 'PLA', 'Czarny', 10, ...)
```

**Status zamówienia: `paid`**

---

### KROK 2: PrintFlow Box odbiera zamówienie (real-time)
```
PrintFlow Box nasłuchuje na Supabase Realtime:
  supabase.channel('orders')
    .on('INSERT', { filter: 'farm_id=eq.MY_FARM_ID' }, handleNewOrder)

Nowe zamówienie wpada → Box sprawdza reguły auto-accept:
```

**Reguły auto-accept (konfigurowalne przez farmę):**
```javascript
const rules = {
  max_order_value: 500,        // auto-accept do 500 zł
  allowed_materials: ['PLA', 'PETG'],  // tylko te materiały auto
  new_client_manual: true,     // nowy klient = ręcznie
  night_mode: {                // tryb nocny
    enabled: true,
    hours: '22:00-06:00',
    only_materials: ['PLA'],   // nocą tylko PLA (bezpieczny)
  },
  min_stock_grams: 200,        // min filament na stanie
}
```

**Sprawdzenie:**
```
✅ Wartość 427 zł < max 500 zł → OK
✅ Materiał PLA → jest na liście allowed → OK
✅ Klient ma 2 wcześniejsze zamówienia → nie jest nowy → OK
✅ Godzina 14:30 → nie tryb nocny → OK
✅ PLA Czarny na stanie: 2500g, potrzeba ~180g → OK
→ AUTO-ACCEPT!

UPDATE orders SET status = 'accepted' WHERE id = 'order-uuid'
```

**Status: `accepted`**

Gdyby któryś warunek nie spełniony → `status = 'pending_review'` → farma dostaje push notification "Nowe zamówienie wymaga akceptacji"

---

### KROK 3: Auto-slicing
```
Box pobiera plik STL z Supabase Storage:
  GET /storage/v1/object/stl-files/order-uuid/bracket.stl

Box uruchamia PrusaSlicer CLI:
  prusa-slicer --export-gcode \
    --load profile_PLA_standard.ini \
    --infill-percentage 30 \
    --output /tmp/bracket_PLA_standard.gcode \
    bracket.stl

Slicer zwraca:
  {
    "print_time_seconds": 8100,    // 2h 15min
    "filament_used_grams": 18.5,
    "layer_count": 200,
    "dimensions": { "x": 45, "y": 30, "z": 20 }
  }

Dla 10 sztuk:
  total_filament: 10 × 18.5g = 185g
  total_time_single: 10 × 2h15min = 22.5h
```

**G-code zapisany w storage, dane slicingu w bazie.**

---

### KROK 4: Smart assign do drukarek
```
Box sprawdza dostępne drukarki:

  Drukarki farmy:
  ┌──────────────────┬────────┬───────────┬──────────┐
  │ Drukarka         │ Status │ Materiał  │ Nozzle   │
  ├──────────────────┼────────┼───────────┼──────────┤
  │ Bambu X1C #1     │ idle   │ PLA Czarny│ 0.4mm ✅ │
  │ Bambu X1C #2     │ idle   │ PLA Biały │ 0.4mm ❌ │ ← zły kolor
  │ Prusa MK4 #3     │ idle   │ PLA Czarny│ 0.4mm ✅ │
  │ Prusa MK4 #4     │ printing│ PETG     │ 0.4mm ❌ │ ← zajęta
  │ Ender 3 #5       │ idle   │ PLA Czarny│ 0.4mm ✅ │
  └──────────────────┴────────┴───────────┴──────────┘

  Pasujące drukarki: #1, #3, #5 (3 sztuki)

Algorytm rozdziela 10 sztuk na 3 drukarki:
  Bambu X1C #1  → 4 szt (najszybsza, priorytet)
  Prusa MK4 #3  → 3 szt
  Ender 3 #5    → 3 szt

  ETA: ceil(4) × 2h15min = 9h (ograniczone przez najwolniejszy batch)
  Ale realnie: 3 drukarki = ~9h zamiast 22.5h na jednej

UPDATE orders SET status = 'printing', estimated_hours = 9
INSERT INTO print_jobs (order_id, printer_id, quantity, gcode_url, ...)
```

**Status: `printing`**

---

### KROK 5: Auto-start druku
```
Dla każdej drukarki Box wysyła G-code:

Klipper/Moonraker:
  POST http://192.168.1.100:7125/server/files/upload
    → upload bracket_PLA_standard.gcode
  POST http://192.168.1.100:7125/printer/print/start
    → filename: bracket_PLA_standard.gcode

OctoPrint:
  POST http://192.168.1.101/api/files/local
    → upload G-code
  POST http://192.168.1.101/api/job
    → command: "start"

Bambu Lab:
  Cloud API → send_print_job(serial_number, gcode_url)

Drukarka zaczyna drukować!
```

---

### KROK 6: Live monitoring
```
Co 10 sekund Box odpytuje każdą drukarkę:

Klipper:
  GET http://192.168.1.100:7125/printer/objects/query
    → progress: 0.62 (62%)
    → hotend_temp: 210°C
    → bed_temp: 60°C
    → print_duration: 4800s
    → estimated_time: 8100s

Box aktualizuje Supabase:
  UPDATE print_jobs SET progress = 62, temp_hotend = 210, temp_bed = 60

Strona czyta przez Supabase Realtime → klient widzi live:
  "Drukuje: 62% | ETA: 52 min | 210°C"
```

---

### KROK 7: AI Quality Guard
```
Co 30 sekund Box pobiera klatkę z kamery:

Klipper: GET http://192.168.1.100/webcam/?action=snapshot
Bambu: wbudowany stream

Box przepuszcza przez YOLO model (uruchomiony na Pi):
  python3 detect.py --source frame.jpg --weights spaghetti_v3.pt

Wynik:
  ✅ OK (confidence < 0.5) → kontynuuj
  ⚠️ SPAGHETTI (confidence 0.97) → ALARM!

Przy wykryciu defektu:
  1. Box wysyła PAUSE do drukarki:
     POST http://192.168.1.100:7125/printer/print/pause
  
  2. UPDATE print_jobs SET status = 'paused', pause_reason = 'spaghetti_detected'
  
  3. Powiadomienie do farmy:
     - Push notification: "🔴 Spaghetti na Bambu X1C #1! Auto-paused."
     - Email
     - Dashboard alert
  
  4. Farma decyduje:
     [Resume] → POST /printer/print/resume
     [Cancel + Reprint] → POST /printer/print/cancel → restart z kolejki
```

---

### KROK 8: Druk ukończony → Auto-eject
```
Drukarka raportuje: print_complete = true

Box:
  1. Czeka 60 sekund (chłodzenie)
  
  2. Wysyła komendę eject:
     Bambu: Cloud API → plate_eject()
     Klipper: G-code: G28 X Y → G1 X0 Y235 (przesuwa blat do przodu)
     Custom servo: GPIO pin → servo obraca flex plate → wydruk spada
  
  3. Czeka 30 sekund
  
  4. Kamera sprawdza czy blat pusty:
     detect.py --source frame.jpg --weights empty_bed.pt
     → blat_clear: true ✅
  
  5. Jeśli ta drukarka ma jeszcze sztuki do wydrukowania:
     → Auto-start następnej sztuki (wracamy do kroku 5)
  
  6. Jeśli wszystkie sztuki z tej drukarki gotowe:
     → UPDATE print_jobs SET status = 'completed'
     → Sprawdź czy CAŁE zamówienie ukończone
```

---

### KROK 9: Zamówienie ukończone
```
Wszystkie 10 sztuk wydrukowane (3 drukarki skończyły):

UPDATE orders SET status = 'completed', completed_at = NOW()

Powiadomienia:
  → Farma: "📦 Zamówienie PF-2026-00045 gotowe! 10/10 szt. Do spakowania."
  → Klient: "Twoje zamówienie jest gotowe! Oczekuje na wysyłkę."

Farma widzi w dashboardzie:
  🟢 PF-2026-00045 | 10 szt PLA Czarny | GOTOWE | [Wyślij]
```

**Jedyny ludzki krok: pakowanie i wysyłka.**

---

### KROK 10: Wysyłka
```
Farma pakuje wydruki → klika "Wyślij" w dashboardzie:
  → Wybiera: InPost / Kurier / Odbiór osobisty
  → Wpisuje tracking number (lub generuje etykietę InPost API)

UPDATE orders SET status = 'shipped', shipping_tracking = 'PF123456789'

Klient dostaje:
  "Twoje zamówienie wysłane! Tracking: PF123456789"
  → Link do śledzenia InPost/DPD
```

---

## PrintFlow Box — Hardware

### Wariant 1: Software Agent (budget)
```
Farma instaluje na SWOIM komputerze:
  pip install printflow-agent
  printflow-agent --token FARM_TOKEN

Wymaga: PC włączony 24/7 w sieci z drukarkami
Koszt: 0 zł (software free z Pro/Enterprise)
```

### Wariant 2: PrintFlow Box (premium)
```
Raspberry Pi 5 (8GB) + oficjalny ekran 7" + obudowa + kamera USB

Farma otrzymuje pudełko:
  1. Podłącz do prądu (USB-C)
  2. Podłącz do routera (Ethernet lub WiFi)
  3. Na ekranie pojawia się kod parowania
  4. Wpisz kod w dashboardzie → Box połączony!
  5. Box automatycznie skanuje sieć → znajduje drukarki
  6. Gotowe — farma jest online

Koszt produkcji: ~800 zł
Cena sprzedaży: 999 zł (lub gratis przy rocznym Enterprise)

Na ekranie wyświetla:
  ┌─────────────────────────────┐
  │ PrintFlow Box    14:32     │
  │─────────────────────────────│
  │ 🟢 Bambu X1C #1    62%    │
  │ 🟢 Prusa MK4 #3    88%    │
  │ 🟡 Ender 3 #5      idle   │
  │─────────────────────────────│
  │ 📦 Nowe zamówienia: 2     │
  │ ✅ Gotowe do wysyłki: 3   │
  │─────────────────────────────│
  │ PLA Czarny: 2.3 kg        │
  │ PETG Biały: ⚠️ 150g       │
  └─────────────────────────────┘
```

---

## Co potrzebujemy zbudować (kolejność)

### Faza 1: Software Agent (MVP)
1. **printflow-agent** — skrypt Python/Node na PC farmy
2. Łączy się z Supabase Realtime (nasłuch na nowe zamówienia)
3. Integracja z Klipper/Moonraker REST API
4. Auto-status reporting (idle/printing/error/progress)
5. Komenda start/pause/stop przez API

### Faza 2: Auto-accept + Slicing
1. Reguły auto-accept w dashboardzie
2. PrusaSlicer CLI na agencie
3. Auto-slicing po akceptacji
4. Smart assign algorytm

### Faza 3: AI + Auto-eject
1. YOLO model spaghetti detection
2. Kamera stream processing
3. Auto-pause + alerty
4. Auto-eject (Bambu native, Klipper G-code)
5. Continuous queue

### Faza 4: PrintFlow Box (hardware)
1. Raspberry Pi image z agentem
2. Ekran dotykowy UI
3. Auto-setup (scan sieci, parowanie)
4. Produkcja + wysyłka

---

## Podsumowanie

**Bez FlowPilot™ (Free):**
Klient zamawia → farma ręcznie akceptuje → ręcznie slicuje → ręcznie startuje druk → ręcznie sprawdza jakość → ręcznie pakuje

**Z FlowPilot™ (Enterprise):**
Klient zamawia → ✨ MAGIA ✨ → farma pakuje gotowe wydruki

Różnica: **10 minut vs 0 minut** pracy farmy na zamówienie.
Przy 20 zamówieniach dziennie: **3.3h vs 0h** → farma skaluje bez zatrudniania ludzi.
