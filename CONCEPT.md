# PrintFlow — Koncept v2

## Czym jest PrintFlow

**Marketplace + system zarządzania farmami drukarek 3D.**

Wyobraź sobie Uber Eats ale dla druku 3D:
- Właściciel farmy zakłada konto → konfiguruje drukarki → dostaje link do swojego sklepu
- Klient wchodzi w link → wrzuca STL → auto-wycena → zamawia → płaci
- Albo klient wchodzi na marketplace PrintFlow → widzi wszystkie farmy → porównuje ceny → zamawia

---

## Dwa tryby działania

### 1. Panel właściciela farmy (B2B)
Rejestrujesz się jako "właściciel farmy":

- **Onboarding**: Dodajesz drukarki (model, rozmiar blatu, nozzle, materiały)
- **Konfiguracja wyceny**: Stawka za godzinę, cena materiału/kg, amortyzacja, marża
- **Twój link**: `printflow.pl/farm/twoja-nazwa` — to Twój mini-sklep
- **Dashboard**: Zlecenia, kolejka, statusy drukarek, historia, zarobki
- **Profil publiczny**: Logo, opis, lokalizacja, materiały, czas realizacji, oceny

### 2. Marketplace (B2C)
Klient wchodzi na `printflow.pl`:

- **Przeglądaj farmy**: Lista/mapa farm w okolicy lub online
- **Porównuj**: Ceny, czas realizacji, oceny, materiały
- **Zamów**: Upload STL → auto-wycena z kilku farm naraz → wybierz najlepszą ofertę → zapłać
- **Śledź**: Status zamówienia na żywo

---

## Flow — Właściciel farmy

```
Rejestracja → "Zakładam farmę"
  → Dodaj drukarki (model, materiały, rozmiar blatu)
  → Ustaw cennik (stawka/h, materiał/kg, marża)
  → Dostaj swój link: printflow.pl/farm/nazwa
  → Udostępnij klientom
  → Zlecenia wpadają → auto-wycena → akceptuj/odrzuć
  → Smart scheduling → przypisz do drukarki
  → Drukuj → klient śledzi na żywo
  → Gotowe → wysyłka/odbiór osobisty
```

## Flow — Klient

```
Wchodzi na printflow.pl LUB link farmy
  → Upload STL/3MF → podgląd 3D
  → Wybiera materiał, jakość, kolor
  → Auto-wycena (natychmiast!)
  → Jeśli marketplace: widzi oferty z kilku farm
  → Wybiera farmę → płaci przez Stripe
  → Śledzi status: w kolejce → drukuje → gotowe → wysłane
  → Ocenia farmę po otrzymaniu
```

---

## Kluczowe funkcje

### Dla właściciela farmy
- 🖨️ **Dashboard drukarek** — status live, kolejka, historia
- 💰 **Auto-wycena** — czas × stawka + materiał + amortyzacja + marża (konfigurowalny)
- 🔗 **Własny link** — `printflow.pl/farm/nazwa` do udostępnienia klientom
- 📊 **Statystyki** — zarobki, ilość zleceń, popularność materiałów
- 📦 **Zarządzanie zleceniami** — accept/reject, priorytet, notatki
- 🎨 **Personalizacja profilu** — logo, banner, opis, godziny pracy
- 📱 **Powiadomienia** — nowe zlecenie, druk ukończony, problem z drukarką

### Dla klienta
- 📤 **Upload & wycena** — wrzuć plik, natychmiast znasz cenę
- 🗺️ **Marketplace** — przeglądaj farmy, porównuj ceny i oceny
- 🔍 **Filtry** — lokalizacja, materiał, czas realizacji, cena
- 💳 **Płatność** — Stripe (karta, BLIK)
- 📍 **Tracking** — status na żywo, ETA
- ⭐ **Oceny & recenzje** — po odbiorze zamówienia
- 🔄 **Re-order** — zamów ponownie jednym klikiem

### Marketplace
- 🏪 **Lista farm** — karty z avatar, lokalizacja, ocena, materiały, czas realizacji
- 🗺️ **Mapa** — znajdź farmę w okolicy (odbiór osobisty!)
- 📊 **Ranking** — top farmy wg ocen, szybkości, ilości zleceń
- 🏷️ **Kategorie** — FDM, SLA/resin, metal, nylon, itp.
- 💡 **"Wycenę multi"** — upload STL → wycena z 5 farm naraz → porównaj i wybierz

---

## Kluczowe propozycje (zatwierdzone ✅)

### 1. ⚡ Wycena w 3 sekundy bez konta
Klient wchodzi → drag & drop STL → BOOM cena. Zero rejestracji na start.
Konto dopiero przy składaniu zamówienia. Zero frikcji = max konwersja.

### 2. 💳 Stripe Connect Split (auto-prowizja)
Klient płaci → PrintFlow automatycznie bierze prowizję 5-8% → reszta idzie do farmy.
Zero ręcznych przelewów. Jak Uber. Stripe Connect obsługuje to out-of-the-box.

### 3. 📍 "Druk w okolicy" z GPS
Farmy posortowane po odległości. Odbiór osobisty = taniej (bez kuriera).
Lokalne farmy wygrywają. Mapa z pinami + lista z odległością.

### 4. 🧮 Kalkulator opłacalności farmy
Narzędzie marketingowe do pozyskiwania farm:
"Masz 5 drukarek Bambu P1S? Przy 60% obłożeniu zarobisz X zł/msc na PrintFlow"
Wciąga nowe farmy na platformę.

### 5. 🔄 Subscription Prints (stałe zamówienia)
Firma zamawia np. 50 szt miesięcznie tego samego elementu.
Auto-zlecenie, rabat ilościowy, stały przychód dla farmy.

### 6. 📹 Live Camera Preview (publiczny)
Klient widzi JAK jego wydruk powstaje w real-time.
Mega wow effect, buduje zaufanie, wyróżnia od konkurencji.

### 7. 📊 Ilość sztuk + wycena zbiorcza + ETA
Klient wybiera ile sztuk potrzebuje → system liczy:
- **Cena za sztukę** (z rabatem ilościowym: 10+ szt = -5%, 50+ = -10%, 100+ = -15%)
- **Cena całkowita**
- **Estimated time** — ile to potrwa na dostępnych drukarkach
  - 1 szt na 1 drukarce = 4h
  - 10 szt na 3 drukarkach = ~14h (parallel printing)
  - 100 szt na 5 drukarkach = ~3 dni
- **Opcje szybkości**: Standard (najtaniej) / Express +30% (priorytet w kolejce) / Rush +50% (natychmiast)

```
Upload STL → Wybierz materiał/kolor → Ile sztuk? [____]
  → Cena za szt: 45 zł (przy 10+ szt: 42.75 zł/szt)
  → Razem: 427.50 zł
  → Szacowany czas: ~14h (3 drukarki równolegle)
  → [Standard 427 zł / 14h] [Express 555 zł / 8h] [Rush 641 zł / 4h]
  → [Złóż zamówienie]
```

---

### 8. 🔲 QR kod farmy
Każda farma generuje unikalny QR w panelu → klient skanuje telefonem i ląduje na profilu farmy.
Można wydrukować i powiesić fizycznie przy farmie, na wizytówce, na targach.

### 9. 🏠 Landing page split: "Kupuję" vs "Mam farmę"
Strona główna z dwoma ścieżkami:
- **Kupuję** → uploader STL / przeglądanie farm / porównanie cen
- **Mam farmę** → rejestracja, setup drukarek, dashboard

### 10. 🧠 Smart matching — upload → rekomendacja farm
Klient wrzuca STL → system dopasowuje farmy po: rozmiarze blatu, dostępnym materiale, wolnych mocach, cenie, lokalizacji.
Ranking: "Top farmy dla Twojego projektu" posortowane po najlepszym dopasowaniu.

### 11. 📋 Panel zamówień farmy
Dedykowana zakładka "Zlecenia" w dashboardzie — lista wszystkich zamówień z filtrami (status, data, klient), kliknięcie → szczegóły z podglądem 3D, statusem drukarek, chatem z klientem.

### 12. 🖨️ Panel drukarek (per drukarka)
- Status live (idle/printing/error)
- Podgląd z kamery
- Progress %, temp hotend/bed, ETA
- Historia druków (success rate, total godzin)
- Koszt eksploatacji (prąd, amortyzacja)
- Notatki serwisowe ("wymieniony nozzle 15.03")
- Remote: start/pause/stop/cancel

### 13. 🤖 Tryb "Autopilot" — Full Autonomous Farm (Enterprise)
Zero ludzkiej interwencji od zamówienia do pakowania:
1. Klient zamawia → auto-weryfikacja STL → auto-accept (jeśli spełnia kryteria)
2. Auto-slicing → auto-assign do drukarki → auto-start
3. AI monitoring → auto-eject → następny druk z kolejki
4. Gotowe → powiadomienie "spakuj i wyślij"

**Safety rules (konfigurowalne):**
- Max wartość auto-accept (np. do 500 zł, powyżej ręcznie)
- Nowy klient (0 zamówień) = ręczna akceptacja
- Materiał ABS/Nylon = ręcznie (wymaga obudowy)
- Tryb nocny: tylko PLA, bezpieczne drukarki
- Anomalia AI: zawsze pause + alert

### 14. 🔧 Auto-eject & Continuous Queue
- Bambu: wbudowany plate eject
- Prusa/Ender: flex plate + servo → wydruk spada do pudełka
- PrintFlow: print complete → eject → czeka 30s → start kolejnego
- Kamera weryfikuje pusty blat
- Smart batching: grupuje zlecenia po materiale/kolorze = zero przezbrojenia

### 15. 🔧 Maintenance Scheduler
- Liczy godziny pracy drukarki
- Alert: "500h — czas na serwis nozzle"
- Auto-blokada po X godzin bez serwisu
- Historia serwisów

### 16. ⚡ Power Monitoring (opcja)
- Smart plug (Shelly/Tasmota) mierzy zużycie prądu
- Anomalia = wykrycie problemu
- Realny koszt prądu per druk

---

## Model przychodów

**Zasada: Marketplace ZAWSZE za darmo. Płatna jest automatyzacja.**

| Plan | Cena | Co dostaje |
|------|------|-----------|
| **Free** | 0 zł | Marketplace (profil, zlecenia, auto-wycena, panel zamówień) + menedżer 3 drukarek (ręczne statusy) |
| **Pro** | 149 zł/msc | Wszystko z Free + integracja API drukarek, live monitoring + kamery, AI QC, smart scheduling, stock management, analytics — do 20 drukarek |
| **Enterprise** | 499 zł/msc | Wszystko z Pro + ∞ drukarek, API publiczne, self-hosted, SLA |

| Dodatkowe przychody | Opis |
|---------------------|------|
| **Prowizja 7%** | Od każdej transakcji przez marketplace (free i pro) |
| **Featured listing** | 99 zł/msc za wyróżnienie na marketplace |
| **Express surcharge** | +2% z dopłaty Express/Rush |

---

## Stack (bez zmian)
- Next.js 15 + TypeScript + Tailwind + shadcn/ui
- PostgreSQL + Prisma (multi-tenant, RLS)
- FastAPI Python workers (slicing, AI)
- BullMQ + Redis
- Stripe (płatności + prowizja Connect)
- Three.js (podgląd 3D)
- Docker Compose → K8s

## Paleta kolorów (website)
- Deep Ocean: granat `#0f172a`, blue `#3b82f6`, coral `#ff6b6b`
