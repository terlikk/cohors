# Jak działa PrintFlow — Szczegółowy opis krok po kroku

---

## CZĘŚĆ 1: WŁAŚCICIEL FARMY (rejestracja i setup)

### Krok 1: Rejestracja
1. Wchodzi na `printflow.pl`
2. Klika "Załóż farmę" (albo "Zarejestruj się" → wybiera typ konta "Właściciel farmy")
3. Podaje: email, hasło, imię i nazwisko (lub loguje się przez Google)
4. Potwierdza email (link aktywacyjny)
5. Trafia do **Onboarding Wizard** — krok po kroku konfiguruje farmę

### Krok 2: Onboarding — Profil farmy
1. **Nazwa farmy** — np. "3DPrint Warszawa" (staje się slugiem: `printflow.pl/farm/3dprint-warszawa`)
2. **Logo** — upload grafiki (kwadrat, min 256x256)
3. **Banner** — opcjonalnie, panoramiczny (1200x400)
4. **Opis** — tekst o farmie, specjalizacja, doświadczenie (max 500 znaków)
5. **Lokalizacja** — adres lub pin na mapie (GPS lat/lng). Ważne dla "druk w okolicy"
6. **Godziny pracy** — np. Pon-Pt 8:00-18:00, Sob 9:00-14:00
7. **Kontakt** — telefon (opcjonalnie), widoczny tylko po zamówieniu
8. **Metody dostawy** — zaznacza co oferuje:
   - ☑️ Odbiór osobisty (podaje adres)
   - ☑️ Kurier (podaje stawki: InPost Paczkomat / DPD / Poczta)
   - ☑️ InPost Paczkomat

### Krok 3: Onboarding — Dodawanie drukarek
Dla każdej drukarki podaje:
1. **Nazwa** — np. "Bambu X1C #1", "Prusa MK4 #2"
2. **Model drukarki** — wybór z listy (Bambu X1C, P1S, A1, Prusa MK4, Ender 3, Voron, inne)
3. **Rozmiar blatu** — X × Y × Z w mm (np. 256 × 256 × 256)
4. **Średnica nozzle** — 0.4mm (default), 0.6mm, 0.8mm
5. **Obsługiwane materiały** — checkboxy: PLA, PETG, ABS, TPU, ASA, Nylon, PC, inne
6. **Typ API** — jak się łączy z drukarką:
   - Klipper/Moonraker (podaje URL: `http://192.168.1.100:7125`)
   - OctoPrint (podaje URL + API key)
   - Bambu Lab Cloud (podaje serial number + token)
   - Prusa Connect (podaje API key)
   - Ręczny (bez API — właściciel ręcznie zmienia statusy)
7. **Kamera** — URL streamu MJPEG (opcjonalnie, do live preview)
8. System testuje połączenie → zielony checkmark ✅ lub error ❌

Może dodać wiele drukarek (przycisk "+ Dodaj kolejną drukarkę").

### Krok 4: Onboarding — Materiały i cennik
Dla każdego materiału:
1. **Typ** — PLA, PETG, ABS, TPU...
2. **Kolor** — czarny, biały, czerwony, niebieski, zielony, custom
3. **Producent** — Fiberlogy, Prusa, eSUN, Spectrum, inne
4. **Cena za kg** — np. 89 zł/kg (materiał, który zużywa klient)
5. **Stan magazynowy** — ile gramów na stanie (np. 2500g)
6. **Alert niski stan** — powiadomienie gdy spadnie poniżej (np. 200g)

**Cennik globalny farmy:**
1. **Stawka za godzinę druku** — np. 25 zł/h (czas pracy drukarki)
2. **Amortyzacja** — np. 3 zł/h (zużycie drukarki, serwis, prąd)
3. **Marża** — np. 20% (zysk farmy)
4. **Minimum zamówienia** — np. 30 zł (nie opłaca się drukować za 5 zł)
5. **Rabaty ilościowe** — konfigurowalne:
   - 10-49 szt: -5%
   - 50-99 szt: -10%
   - 100+ szt: -15%
   - Custom (np. 500+ szt: -20%)

### Krok 5: Stripe Connect — podłączenie płatności
1. System przekierowuje na Stripe Connect onboarding
2. Właściciel podaje dane firmy (NIP, IBAN, dane osobowe)
3. Stripe weryfikuje tożsamość (zwykle 1-2 dni)
4. Po weryfikacji → płatności od klientów trafiają automatycznie:
   - 93% → konto farmy
   - 7% → konto PrintFlow (prowizja)
5. Wypłaty na konto bankowe: automatyczne (co tydzień) lub ręczne

### Krok 6: Farma jest gotowa! 🎉
- Profil publiczny: `printflow.pl/farm/3dprint-warszawa`
- Farma widoczna na marketplace
- Dashboard z zerowym stanem — czeka na pierwsze zlecenie
- Właściciel dostaje link do udostępnienia klientom

---

## CZĘŚĆ 2: KLIENT (zamawianie wydruku)

### Krok 1: Wejście na stronę
Klient może wejść na 3 sposoby:
- **A) Marketplace** — `printflow.pl` → przegląda farmy
- **B) Link farmy** — `printflow.pl/farm/3dprint-warszawa` → bezpośrednio do konkretnej farmy
- **C) Widget** — na stronie farmy jest osadzony widget PrintFlow (iframe)

### Krok 2: Upload pliku (BEZ KONTA!)
1. Klient widzi duży drag & drop area: "Wrzuć plik STL lub 3MF"
2. Przeciąga plik z komputera (lub klika "Wybierz plik")
3. Akceptowane formaty: `.stl`, `.3mf`, `.obj`
4. Max rozmiar: 100 MB
5. Plik jest uploadowany na serwer

### Krok 3: Walidacja modelu (automatyczna, 2-5 sek)
System sprawdza:
1. **Czy plik jest poprawny** — parsuje geometrię
2. **Manifold check** — czy model jest "wodoszczelny" (zamknięty)
3. **Wymiary** — X × Y × Z w mm
4. **Czy mieści się na blacie** — porównuje z drukarkami farmy
5. **Ilość trójkątów** — informacja o złożoności

Jeśli błąd:
- Non-manifold → "Twój model ma błędy. Chcesz żebyśmy go naprawili automatycznie?" → [Napraw] [Prześlij mimo to]
- Za duży na blat → "Ten model nie mieści się na żadnej drukarce tej farmy. Wymiary: 300×200×150mm, max blat: 256×256×256mm"

### Krok 4: Podgląd 3D
1. Model renderowany w Three.js — klient widzi go w 3D
2. Może obracać, zoomować, przesuwać
3. Widzi wymiary, objętość, ilość trójkątów
4. Widzi thumbnail (auto-generated render)

### Krok 5: Konfiguracja zamówienia
Klient wybiera:

**a) Materiał** — dropdown z dostępnymi:
- PLA (najtańszy, najpopularniejszy)
- PETG (wytrzymalszy, odporny na temperaturę)
- ABS (twardy, wymaga obudowy)
- TPU (elastyczny, gumowy)
- ...

Przy każdym materiale: krótki opis + różnica w cenie

**b) Kolor** — zależy od materiałów na stanie farmy:
- Czarny, Biały, Czerwony, Niebieski, Zielony, Żółty, Pomarańczowy...
- Przy każdym kolorze: kropka z kolorem + "Na stanie: 1800g"

**c) Jakość druku:**
- Draft (0.3mm layer) — najszybciej, najtaniej, widoczne warstwy
- Standard (0.2mm layer) — balans jakości i czasu ← domyślne
- High (0.12mm layer) — najlepsza jakość, najdłużej, najdrożej

**d) Ilość sztuk:**
- Input numeryczny: [1] (domyślnie)
- Klient wpisuje np. 10
- Natychmiast przelicza cenę i czas

**e) Wypełnienie (infill):**
- 15% — lekki, szybki (figurki, dekoracje)
- 30% — standard ← domyślne
- 50% — mocny (części funkcjonalne)
- 100% — pełny (max wytrzymałość)

### Krok 6: Auto-wycena (natychmiastowa!)
System w tle robi slicing (PrusaSlicer CLI):

**Obliczenie:**
```
1. Slicing → czas druku: 2h 15min, materiał: 45g
2. Koszt materiału: 45g × (89 zł / 1000g) = 4.01 zł
3. Koszt czasu: 2.25h × 25 zł/h = 56.25 zł
4. Amortyzacja: 2.25h × 3 zł/h = 6.75 zł
5. Suma bazowa: 4.01 + 56.25 + 6.75 = 67.01 zł
6. Marża 20%: 67.01 × 1.20 = 80.41 zł
7. Zaokrąglenie: 80.50 zł za sztukę
```

**Jeśli 10 sztuk:**
```
8. 10 × 80.50 = 805.00 zł
9. Rabat 10+ szt (-5%): 805.00 × 0.95 = 764.75 zł
10. Cena za sztukę po rabacie: 76.48 zł
```

**Klient widzi:**
```
┌─────────────────────────────────┐
│ 📦 Wycena zamówienia            │
│                                 │
│ bracket.stl                     │
│ PLA Czarny · Standard · 30%    │
│                                 │
│ Cena za sztukę:  80.50 zł      │
│ Ilość:           10 szt        │
│ Rabat ilościowy: -5%           │
│ ─────────────────────────       │
│ Razem:           764.75 zł     │
│                                 │
│ ⏱️ Szacowany czas:              │
│                                 │
│ ● Standard    ~8h    764.75 zł │
│ ● Express     ~5h    994.18 zł │
│ ● Rush        ~3h  1,147.13 zł │
│                                 │
│ (3 drukarki drukują równolegle) │
│                                 │
│ 📦 Dostawa:                     │
│ ○ Odbiór osobisty   0 zł       │
│ ○ InPost Paczkomat  15 zł      │
│ ○ Kurier DPD        20 zł      │
│                                 │
│ [Złóż zamówienie →]            │
└─────────────────────────────────┘
```

**Szacowany czas - jak liczy:**
```
1 drukarka:  10 szt × 2h15min = 22.5h
2 drukarki:  ceil(10/2) × 2h15min = 11.25h
3 drukarki:  ceil(10/3) × 2h15min = 8h (zaokrąglone w górę)
+ bufor 15% na zmianę filamentu, czyszczenie blatu
= ~8h (Standard), Express = ~5h, Rush = ~3h
```

### Krok 7: Marketplace — porównanie farm (opcjonalnie)
Jeśli klient wszedł przez marketplace (nie bezpośredni link):
1. Po upload i konfiguracji widzi **wyceny z kilku farm naraz**
2. Każda farma pokazuje:
   - Nazwa + avatar + ocena (★4.8)
   - Cena za zamówienie
   - Szacowany czas
   - Odległość (jeśli GPS)
   - Badge "Verified" (jeśli ma)
3. Klient wybiera farmę → przechodzi do checkout

### Krok 8: Zakładanie konta (dopiero teraz!)
1. Klient klika "Złóż zamówienie"
2. Pojawia się: "Załóż konto żeby złożyć zamówienie"
3. Podaje: email, hasło (lub Google login)
4. Opcjonalnie: imię, telefon, adres dostawy
5. Konto utworzone → automatycznie wraca do checkout

### Krok 9: Płatność
1. System tworzy Stripe Checkout Session
2. Klient widzi podsumowanie:
   - Wydruk 3D: 764.75 zł
   - Dostawa InPost: 15.00 zł
   - **Razem: 779.75 zł**
3. Metody płatności:
   - Karta (Visa/MC)
   - BLIK
   - Przelew (P24)
4. Klient płaci → Stripe potwierdza → webhook

**Stripe Connect podział:**
```
Klient płaci: 779.75 zł
Stripe fee (2.9% + 1 zł): ~23.61 zł
PrintFlow prowizja (7%): ~54.58 zł
Farma dostaje: ~701.56 zł
```

### Krok 10: Zamówienie złożone!
1. Klient widzi: "Zamówienie złożone! 🎉 Numer: PF-2026-00042"
2. Email potwierdzający z detalami
3. Status: **"Oczekuje na akceptację farmy"**
4. Klient trafia na stronę trackingu

---

## CZĘŚĆ 3: REALIZACJA (po stronie farmy)

### Krok 1: Nowe zlecenie — powiadomienie
1. Właściciel farmy dostaje:
   - 🔔 Push notification w przeglądarce
   - 📧 Email: "Nowe zlecenie PF-2026-00042"
   - 📱 Powiadomienie w dashboardzie (czerwona kropka)
2. W dashboardzie widzi kartę zlecenia:
   - Plik: bracket.stl (z podglądem 3D)
   - Materiał: PLA Czarny
   - Jakość: Standard
   - Ilość: 10 szt
   - Cena: 764.75 zł (do wypłaty: ~701.56 zł)
   - ETA: ~8h
   - Klient: Jan Kowalski

### Krok 2: Akceptacja lub odrzucenie
Właściciel ma 3 opcje:
- **[Akceptuj]** → zlecenie przechodzi do kolejki
- **[Odrzuć]** → musi podać powód → klient dostaje zwrot przez Stripe
- **[Wyślij wiadomość]** → chat z klientem (pytania, uściślenia)

Timeout: jeśli brak reakcji przez 24h → auto-odrzucenie + zwrot

### Krok 3: Smart Scheduling (auto lub ręczny)
Po akceptacji system proponuje przydział:

**Auto-assign (domyślnie):**
```
Zlecenie: 10 szt bracket.stl, PLA Czarny
Dostępne drukarki z PLA Czarny:
  - Bambu X1C #1 (idle) — blat 256mm ✅ — przypisz 4 szt
  - Bambu X1C #2 (idle) — blat 256mm ✅ — przypisz 3 szt
  - Prusa MK4 #3 (idle) — blat 250mm ✅ — przypisz 3 szt
ETA: ~8h (3 drukarki równolegle)
```

**Ręczny assign:**
Właściciel może drag & drop przypisać sztuki do drukarek jak chce.

### Krok 4: Start druku
1. System wysyła G-code do drukarek przez API:
   - Klipper: `POST /api/printer/print/start` z plikiem G-code
   - OctoPrint: `POST /api/files/local` + `POST /api/job` (start)
   - Bambu: Cloud API → send print job
2. Status drukarki zmienia się: `idle` → `printing`
3. Status zlecenia: `queued` → `printing`
4. Klient dostaje powiadomienie: "Twoje zamówienie jest drukowane! 🖨️"

### Krok 5: Live monitoring
**Dashboard właściciela:**
```
┌─ Bambu X1C #1 ─────────────────┐
│ 🟢 Printing                     │
│ bracket.stl (4/10 szt, szt 1/4)│
│ ████████████░░░░░░░░ 62%        │
│ Warstwa: 124/200                │
│ Temp: hotend 210°C, bed 60°C   │
│ ETA: 0h 52min                   │
│ [📷 Live kamera] [⏸ Pause]      │
└─────────────────────────────────┘
```

**Klient (publiczny tracking):**
```
Zamówienie PF-2026-00042
Status: 🖨️ Drukowanie (3 drukarki równolegle)
Progress: ████████░░░░ 62% (6/10 szt ukończone)
ETA: ~3h do ukończenia

[📹 Oglądaj live] ← stream z kamery
```

### Krok 6: AI Quality Control (w tle)
1. Co 30 sekund system pobiera klatkę z kamery
2. Model YOLO analizuje obraz:
   - ✅ OK → kontynuuj
   - ⚠️ Spaghetti detected (confidence >90%) → **AUTO-PAUSE**
   - ⚠️ Warping detected → alert (bez pause)
   - ⚠️ Layer shift → alert
3. Przy auto-pause:
   - Drukarka dostaje komendę pause
   - Właściciel dostaje alert: "🔴 Spaghetti detected na Bambu X1C #1! Auto-paused."
   - Właściciel sprawdza, decyduje: [Resume] [Cancel + reprint]
4. Klient widzi: "Wykryto problem, drukarka zatrzymana. Właściciel farmy został powiadomiony."

### Krok 7: Druk ukończony
1. Drukarka raportuje: print complete
2. System zmienia status drukarki: `printing` → `idle`
3. Jeśli są kolejne sztuki do wydrukowania na tej drukarce:
   - Czeka na wymianę blatu (alert do właściciela)
   - Właściciel potwierdza "Blat gotowy" → następna sztuka startuje
4. Kiedy WSZYSTKIE 10 sztuk gotowe:
   - Status zlecenia: `printing` → `completed`
   - Powiadomienie do właściciela: "Zlecenie PF-2026-00042 ukończone! 10/10 szt"
   - Timelapse video (opcjonalnie) — generowany z klatek kamery

### Krok 8: Wysyłka
Właściciel:
1. Pakuje wydruki
2. W dashboardzie klika "Wyślij" → wybiera metodę:
   - **Odbiór osobisty** → klient dostaje powiadomienie "Gotowe do odbioru pod adresem: ul. Marszałkowska 10, Warszawa"
   - **InPost** → właściciel generuje etykietę (integracja InPost API), wpisuje numer nadania
   - **Kurier** → wpisuje numer śledzenia
3. Status: `completed` → `shipped`
4. Klient dostaje email/push: "Twoje zamówienie zostało wysłane! Tracking: INPOST123456"

### Krok 9: Dostarczenie
1. Klient odbiera paczkę
2. Klika w systemie "Odebrane" (lub auto po 7 dniach)
3. Status: `shipped` → `delivered`
4. Pieniądze zwalniane do farmy (Stripe Connect payout)
5. Klient dostaje prośbę o ocenę

### Krok 10: Recenzja
1. Klient widzi: "Jak oceniasz zamówienie z 3DPrint Warszawa?"
2. Ocena: ★★★★★ (1-5 gwiazdek)
3. Komentarz: "Świetna jakość, szybka realizacja!"
4. Zdjęcia: może dodać foto wydruku (max 4)
5. Recenzja widoczna na profilu farmy

---

## CZĘŚĆ 4: PANEL DASHBOARDU — co widzi właściciel na co dzień

### Główna strona dashboardu
```
┌─────────────────────────────────────────┐
│ 3DPrint Warszawa — Dashboard            │
├─────────────────────────────────────────┤
│                                         │
│ 💰 Dziś: 1,245 zł  │ 📦 Nowe: 3       │
│ 📊 Ten miesiąc:     │ 🖨️ Drukuje: 5   │
│    18,420 zł        │ ✅ Gotowe: 2      │
│                                         │
│ ─── Drukarki ───                        │
│ 🟢 Bambu X1C #1  — bracket.stl  62%    │
│ 🟢 Bambu X1C #2  — case.stl     88%    │
│ 🟢 Prusa MK4 #3  — gear.stl     15%    │
│ 🟡 Prusa MK4 #4  — idle (w kolejce: 2) │
│ 🔴 Ender 3 #5    — error (nozzle clog) │
│                                         │
│ ─── Ostatnie zlecenia ───               │
│ PF-00042  Jan K.   10 szt  764 zł  🖨️  │
│ PF-00041  Anna M.  1 szt   80 zł   📦  │
│ PF-00040  TechParts 50 szt 3200 zł ✅  │
│                                         │
│ ─── Alerty ───                          │
│ ⚠️ PLA Biały: niski stan (150g)         │
│ ⚠️ Ender 3 #5: nozzle clog error       │
└─────────────────────────────────────────┘
```

### Panel zamówień (zakładka "Zlecenia")
```
┌─ Zamówienia ────────────────────────────────┐
│ 🔍 Szukaj    Filtr: [Wszystkie ▼] [Dziś ▼] │
│                                              │
│ 🟡 PF-00045  Anna M.    1 szt   80 zł      │
│    PLA Czarny · Standard · Nowe (2min temu)  │
│    [Akceptuj] [Odrzuć] [Chat]               │
│                                              │
│ 🖨️ PF-00044  Jan K.    10 szt  764 zł      │
│    PLA Czarny · Standard · Drukuje 62%       │
│    Bambu X1C #1, #2, Prusa #3               │
│                                              │
│ 🖨️ PF-00043  TechParts  50 szt 3200 zł     │
│    PETG Biały · High · Drukuje 34%          │
│    5 drukarek · ETA: 12h                     │
│                                              │
│ ✅ PF-00042  Marek W.    3 szt  240 zł      │
│    ABS Czerwony · Gotowe · Do wysyłki       │
│    [Wyślij]                                  │
│                                              │
│ 📦 PF-00041  Kasia P.    1 szt   95 zł     │
│    PLA Biały · Wysłane · InPost XYZ123      │
│                                              │
│ ✅ PF-00040  Adam Z.     2 szt  160 zł      │
│    Dostarczone · ★★★★★                      │
└──────────────────────────────────────────────┘
```

**Filtry:** Wszystkie / Nowe / Drukuje / Gotowe / Wysłane / Dostarczone / Odrzucone
**Sortowanie:** Najnowsze / Najstarsze / Najwyższa kwota / Priorytet

Kliknięcie zamówienia → szczegóły: pliki (podgląd 3D), status drukarek, chat z klientem, historia zmian statusu, dane wysyłki.

### Zakładki w panelu
- **Dashboard** — overview (powyżej)
- **Zlecenia** — panel zamówień z filtrami (jak powyżej)
- **Drukarki** — status, kamery, historia, ustawienia
- **Materiały** — stock, ceny, alerty
- **Klienci** — lista, historia zamówień
- **Finanse** — zarobki, prowizje, wypłaty, wykresy
- **Chat** — wiadomości od klientów
- **Ustawienia** — profil, cennik, powiadomienia, Stripe

---

## CZĘŚĆ 5: MARKETPLACE — widok klienta

### Strona główna printflow.pl
```
┌─────────────────────────────────────────┐
│ 🖨️ PrintFlow                            │
│                                         │
│ [Wrzuć plik STL i otrzymaj wycenę      │
│  w 3 sekundy — bez rejestracji]        │
│                                         │
│ ─── lub przeglądaj farmy ───            │
│                                         │
│ 🔍 Szukaj: [___________] 📍 Warszawa   │
│ Filtry: Materiał ▼  Cena ▼  Ocena ▼    │
│                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ 3DPrint  │ │ MakerLab │ │ PrintHUB │ │
│ │ Warszawa │ │ Kraków   │ │ Wrocław  │ │
│ │ ★4.8     │ │ ★4.6     │ │ ★4.9     │ │
│ │ 8 druk.  │ │ 12 druk. │ │ 5 druk.  │ │
│ │ od 45 zł │ │ od 38 zł │ │ od 52 zł │ │
│ │ 📍 2.3km │ │ 📍 280km │ │ 📍 340km │ │
│ │ ✅Verified│ │          │ │ ✅Verified│ │
│ │ PLA PETG │ │ PLA ABS  │ │ PLA PETG │ │
│ │ ABS TPU  │ │ PETG     │ │ Nylon    │ │
│ └──────────┘ └──────────┘ └──────────┘ │
│                                         │
│ [🗺️ Pokaż na mapie]                    │
└─────────────────────────────────────────┘
```

### Mapa farm
- Google Maps / Mapbox z pinami farm
- Klikasz pin → mini-karta farmy → "Zobacz profil"
- Sortowanie po odległości od Twojej lokalizacji
- Filtr: "Tylko z odbiorem osobistym"

---

## PODSUMOWANIE STATUSÓW ZAMÓWIENIA

```
[Pending] → [Accepted] → [Queued] → [Printing] → [Completed] → [Shipped] → [Delivered]
    ↓           ↓                        ↓
[Rejected]   [Cancelled]            [Paused - AI]
(zwrot)      (zwrot)                (resume/reprint)
```

Każda zmiana statusu = powiadomienie do klienta (email + push).
