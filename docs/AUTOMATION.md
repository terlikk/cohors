# PrintFlow — Full Automation & PrintFlow Box

## Jak działa pełna automatyzacja (FlowPilot™)

### Architektura

```
┌─────────────────────────────────────────────────────┐
│                  INTERNET                            │
│                                                      │
│  ┌──────────────┐         ┌───────────────────────┐ │
│  │ Klient       │         │ PrintFlow Cloud       │ │
│  │ (przeglądarka)│ ──────→│ (Vercel + Supabase)   │ │
│  │              │         │                       │ │
│  │ Upload STL   │         │ - Strona/App          │ │
│  │ Zamów druk   │         │ - Baza danych         │ │
│  │ Śledź status │         │ - Storage (pliki STL) │ │
│  └──────────────┘         │ - Realtime WebSocket  │ │
│                           └───────────┬───────────┘ │
│                                       │              │
│                          WebSocket (stałe połączenie)│
│                                       │              │
│  ┌────────────────────────────────────▼────────────┐ │
│  │           SIEĆ LOKALNA FARMY (LAN)              │ │
│  │                                                  │ │
│  │  ┌──────────────────────────┐                   │ │
│  │  │ PrintFlow Box / Agent    │                   │ │
│  │  │ (Raspberry Pi lub PC)    │                   │ │
│  │  │                          │                   │ │
│  │  │ - Nasłuchuje na zlecenia │                   │ │
│  │  │ - Sprawdza reguły        │                   │ │
│  │  │ - Slicuje STL→G-code     │                   │ │
│  │  │ - Wysyła do drukarek     │                   │ │
│  │  │ - Monitoruje status      │                   │ │
│  │  │ - Analizuje kamerę (AI)  │                   │ │
│  │  │ - Steruje auto-eject     │                   │ │
│  │  └──────┬──────┬──────┬─────┘                   │ │
│  │         │      │      │                          │ │
│  │    ┌────▼──┐ ┌─▼────┐ ┌▼─────┐                  │ │
│  │    │Bambu  │ │Prusa │ │Ender │  ... (LAN API)   │ │
│  │    │X1C #1 │ │MK4 #2│ │3 #3  │                  │ │
│  │    └───────┘ └──────┘ └──────┘                   │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Krok po kroku: Co się dzieje gdy klient zamawia

### 1. Klient wrzuca plik i zamawia (strona)
- Klient wchodzi na printflow.pl → upload STL → wybiera materiał, kolor, ilość, jakość
- System liczy szacunkowy czas i cenę (na podstawie profilu farmy)
- Klient klika "Zamów" → płaci przez Stripe
- Order trafia do Supabase z statusem `new`

### 2. PrintFlow Box odbiera zamówienie (automatycznie)
- Box jest cały czas połączony z Supabase przez **Realtime WebSocket**
- Jak pojawi się nowy order dla tej farmy → Box go natychmiast widzi
- Zero pollingu, zero opóźnień — real-time push

### 3. Auto-accept (sprawdzanie reguł)
Box sprawdza reguły ustawione przez właściciela farmy:

```
✅ Plik poprawny? (walidacja STL)
✅ Materiał na stanie? (sprawdza stock filamentu w DB)
✅ Mieści się na blacie? (wymiary modelu vs rozmiar drukarki)
✅ Kwota poniżej limitu? (np. max 500 zł auto-accept)
✅ Klient zweryfikowany? (min 1 zamówienie lub wyłączone)
✅ Materiał dozwolony w auto-mode? (np. ABS = ręcznie, PLA = auto)
✅ Godziny pracy? (np. nocą tylko PLA)
```

- Wszystkie ✅ → **auto-accept**, status zmienia się na `accepted`
- Którekolwiek ❌ → **czeka na ręczną akceptację**, właściciel dostaje powiadomienie

### 4. Auto-slicing (generowanie G-code)
- Box pobiera plik STL z Supabase Storage
- Uruchamia **PrusaSlicer CLI** lokalnie na Pi:
  ```bash
  prusa-slicer --export-gcode --load profile.ini model.stl -o output.gcode
  ```
- Parametry slicingu z zamówienia: materiał, jakość (0.2mm/0.12mm), infill (30%/50%/100%)
- Wynik: G-code + dokładny czas druku + dokładne zużycie filamentu (gramy)
- Dane zapisywane w Supabase (prawdziwe, nie szacunkowe)

### 5. Auto-assign (wybór drukarki)
Box wybiera optymalną drukarkę:

```
Kryteria (w kolejności):
1. Ma załadowany odpowiedni filament (typ + kolor)?
2. Jest idle (nie drukuje)?
3. Blat wystarczająco duży?
4. Nozzle odpowiedni (0.4mm standard)?
5. Najmniej godzin od ostatniego serwisu (najświeższa)
```

Jeśli wiele drukarek spełnia kryteria → wybiera tę z najmniejszym obłożeniem.
Jeśli żadna nie spełnia → czeka + alert do właściciela.

### 6. Auto-start (wysyłanie G-code do drukarki)
Box wysyła G-code do wybranej drukarki przez lokalne API:

**Klipper/Moonraker:**
```bash
# Upload G-code
curl -X POST http://192.168.1.100:7125/server/files/upload -F "file=@output.gcode"
# Start druku
curl -X POST http://192.168.1.100:7125/printer/print/start -d '{"filename":"output.gcode"}'
```

**OctoPrint:**
```bash
# Upload
curl -X POST http://192.168.1.100:5000/api/files/local -H "X-Api-Key: KEY" -F "file=@output.gcode"
# Start
curl -X POST http://192.168.1.100:5000/api/job -H "X-Api-Key: KEY" -d '{"command":"start"}'
```

**Bambu Lab (Cloud API):**
```bash
# Bambu ma swoje Cloud API — Box wysyła przez MQTT
# Serial number drukarki + access token → push print job
```

Status w Supabase: `accepted` → `printing`
Klient widzi na stronie: "Twój druk właśnie się rozpoczął! 🖨️"

### 7. Monitoring w czasie druku
Box co **10 sekund** odpytuje drukarkę:
- Progress % (warstwa X/Y)
- Temperatura hotend/bed
- Szacowany czas do końca (ETA)
- Status (printing/paused/error)

Dane lecą do Supabase → strona klienta aktualizuje się w real-time.

**AI monitoring (opcja z kamerą):**
- Box co 30 sekund pobiera klatkę z kamery (USB lub IP)
- Puszcza przez model YOLO (lekki, działa na Pi 4/5)
- Wykrywa: spaghetti, warping, layer shift, oderwanie od blatu
- Jeśli problem → **auto-pause** + alert 🔴

### 8. Druk ukończony
Drukarka raportuje: "print complete"

**Bez auto-eject:**
- Alert do właściciela: "Druk gotowy na Bambu #1, zdejmij wydruk"
- Właściciel potwierdza w dashboardzie/na ekranie Box → kolejny druk startuje

**Z auto-eject (Bambu):**
- Box wysyła komendę plate eject przez API
- Wydruk spada do pudełka
- Kamera weryfikuje: blat pusty? ✅
- Kolejny druk z kolejki startuje automatycznie

**Z auto-eject (custom servo na Pi):**
- Box steruje servo motorem przez GPIO
- Servo przesuwa flex plate → wydruk spada
- Kamera weryfikuje → następny druk

### 9. Continuous queue (24/7)
- Box sprawdza kolejkę: są jeszcze zlecenia?
- Jeśli tak → wróć do kroku 5 (auto-assign)
- Jeśli nie → drukarka idle, czeka na następne zamówienie
- Farma pracuje **non-stop** — nocą, w weekendy, bez ludzi

### 10. Powiadomienie do właściciela
- "Masz 5 gotowych wydruków do spakowania 📦"
- Właściciel przychodzi rano, pakuje, wysyła
- Jedyny ludzki moment = pakowanie + wysyłka

---

## PrintFlow Box — Hardware

### Wariant 1: Budget (software only)
- Farma instaluje PrintFlow Agent na swoim PC
- Darmowe, ale PC musi być włączony 24/7
- Dla farm które testują / zaczynają

### Wariant 2: PrintFlow Box Basic (~500 zł)
- Raspberry Pi 5 (4GB) + obudowa + zasilacz + SD 64GB
- Nasz software pre-installed
- Plug & play — podłącz do routera, działa
- Bez ekranu — zarządzanie przez dashboard web

### Wariant 3: PrintFlow Box Pro (~1200 zł)
- Raspberry Pi 5 (8GB) + ekran dotykowy 7" + obudowa premium
- Kamera USB (opcja)
- Ekran pokazuje:
  - Status wszystkich drukarek
  - Podgląd kamer
  - Nowe zamówienia (accept/reject tapnięciem)
  - Alerty (filament, błędy)
  - Statystyki (zarobki, druki dziś)
- Montaż na ścianie obok drukarek

### Software na Box (co tam działa):
- **PrintFlow Agent** (Node.js/Python) — komunikacja z cloud + drukarkami
- **PrusaSlicer CLI** — slicing na urządzeniu
- **YOLO model (lite)** — AI monitoring kamer
- **Dashboard lokal** (na ekranie) — React app w Chromium kiosk mode
- **Auto-update** — Box sam się aktualizuje (apt + git pull)

---

## Safety Rules (konfigurowalne przez właściciela)

| Reguła | Domyślnie | Opis |
|--------|-----------|------|
| Max kwota auto-accept | 500 zł | Powyżej = ręczna akceptacja |
| Nowy klient | Ręcznie | Pierwszy order = zawsze ręcznie |
| Nocny tryb (22-8) | Tylko PLA | Bezpieczne materiały w nocy |
| ABS/Nylon | Ręcznie | Wymaga obudowy, wentylacji |
| Anomalia AI | Zawsze pause | Spaghetti/warping = stop + alert |
| Min stock filamentu | 100g | Poniżej = nie przyjmuj zleceń |
| Max drukarek naraz | Wszystkie | Ile drukarek jednocześnie auto |
| Weekend | Jak w tygodniu | Można wyłączyć auto na weekend |

---

## Timeline

| Faza | Co | Kiedy |
|------|----|-------|
| **MVP (teraz)** | Marketplace + dashboard + zamówienia w DB | Zrobione ✅ |
| **Faza 2** | Prawdziwy slicing + wycena + filament manager | Następne |
| **Faza 3** | PrintFlow Agent (software) — komunikacja z drukarkami | +4-6 tyg |
| **Faza 4** | FlowPilot (auto-accept, auto-start, monitoring) | +2-3 tyg po agencie |
| **Faza 5** | PrintFlow Box (hardware RPi) | +4 tyg po agencie |
| **Faza 6** | AI monitoring (YOLO) + auto-eject | +2-3 tyg po Box |
