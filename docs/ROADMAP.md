# Roadmapa — PrintFlow

## 🏗️ Faza 1 — MVP (6-8 tygodni)
**Cel: Działający marketplace z auto-wyceną**

### Sprint 1 (tyg 1-2): Fundament
- [ ] Setup projektu (Next.js 15, Tailwind, shadcn/ui, Prisma, PostgreSQL)
- [ ] Auth (email/hasło + Google OAuth)
- [ ] Rejestracja: wybór roli (klient / właściciel farmy)
- [ ] DB: users, farms, printers, materials
- [ ] Panel farmy: onboarding wizard (dodaj drukarki, materiały, cennik)
- [ ] Generowanie slug/linku: `printflow.pl/farm/nazwa`

### Sprint 2 (tyg 3-4): Upload & Wycena
- [ ] Upload STL/3MF (drag & drop, walidacja pliku)
- [ ] Slicing worker (PrusaSlicer CLI w Dockerze) — czas druku, waga
- [ ] Auto-wycena: czas × stawka + materiał × waga + amortyzacja + marża
- [ ] Podgląd 3D (Three.js / React Three Fiber)
- [ ] Wybór: materiał, kolor, jakość, **ilość sztuk**
- [ ] Rabaty ilościowe (10+ = -5%, 50+ = -10%, 100+ = -15%)
- [ ] Estimated time z uwzględnieniem równoległego druku
- [ ] Opcje szybkości: Standard / Express / Rush

### Sprint 3 (tyg 5-6): Zamówienia & Płatności
- [ ] Stripe Checkout (karta + BLIK)
- [ ] Stripe Connect onboarding dla farm
- [ ] Auto-split prowizji (7% PrintFlow, 93% farma)
- [ ] Panel zamówień (klient): status, historia, re-order
- [ ] Panel zamówień (farma): accept/reject, przypisz do drukarki, zmień status
- [ ] Powiadomienia email (nowe zlecenie, zmiana statusu)

### Sprint 4 (tyg 7-8): Marketplace
- [ ] Lista farm na marketplace (karty, filtry)
- [ ] Profil publiczny farmy (opis, materiały, galeria, oceny)
- [ ] Wyszukiwanie: materiał, lokalizacja, cena, ocena
- [ ] **GPS: farmy w okolicy** (sortowanie po odległości)
- [ ] Mapa farm (Mapbox / Google Maps)
- [ ] Landing page (ten co już mamy, podpięty)
- [ ] Deploy na Vercel

**Deliverable: Działająca platforma — farma może przyjmować zlecenia, klient może zamawiać**

---

## 📹 Faza 2 — Monitoring & Chat (3-4 tygodnie)
**Cel: Live monitoring drukarek + komunikacja**

- [ ] Integracja Klipper/Moonraker (REST + WebSocket)
- [ ] Integracja OctoPrint (REST API)
- [ ] Live status drukarek w dashboardzie (idle/printing/error)
- [ ] Progress %, temperatury, ETA (WebSockets)
- [ ] Podgląd z kamer (MJPEG stream)
- [ ] **Live camera preview publiczny** (klient widzi swój druk)
- [ ] Chat klient ↔ farma (per zamówienie)
- [ ] Push notifications (web push)
- [ ] Timelapse (zapis klatek → video)

---

## 🤖 Faza 3 — AI & Analytics (3-4 tygodnie)
**Cel: AI quality control + inteligentne zarządzanie**

- [ ] AI spaghetti/warping detection (YOLO model + Python worker)
- [ ] Auto-pause przy wykryciu defektu
- [ ] Alert na telefon/email
- [ ] Smart scheduling — auto-assign do optymalnej drukarki
- [ ] Zarządzanie materiałami (stock, auto-alert przy niskim stanie)
- [ ] Analytics dashboard (zarobki, popularne materiały, success rate)
- [ ] **PrintFlow Score** — algorytm oceny farm
- [ ] **Kalkulator opłacalności farmy** (narzędzie marketingowe)

---

## 🛒 Faza 4 — E-commerce & Scale (4+ tygodni)
**Cel: Integracje, API, skalowanie**

- [ ] **Widget embed** (iframe do osadzenia na stronie farmy)
- [ ] **Wycena multi** — upload STL → wycena z wielu farm naraz
- [ ] Recenzje i oceny farm
- [ ] Galeria realizacji (portfolio farmy)
- [ ] **Subscription prints** (stałe zamówienia)
- [ ] API publiczne (REST) dla firm B2B
- [ ] Shopify / WooCommerce plugin
- [ ] Faktury VAT (auto-generowanie)
- [ ] Referral program
- [ ] Featured listing (płatne wyróżnienie)
- [ ] Bambu Lab Cloud API integration
- [ ] Prusa Connect API integration
- [ ] i18n (PL/EN)
- [ ] Mobile app (React Native) — opcjonalnie

---

## 🚀 Faza 5 — Growth (ongoing)
- [ ] SEO + content marketing
- [ ] Google/FB Ads
- [ ] Partnership z producentami filamentów
- [ ] Ekspansja EU (DE, CZ, SK jako pierwsze)
- [ ] AI Material Advisor (doradca materiałowy)
- [ ] Auto-fix modeli (naprawa STL)
- [ ] Batch orders (wiele plików naraz)
- [ ] Self-hosted Enterprise (Docker image)
