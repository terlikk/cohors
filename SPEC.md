# PrintFlow — Pełna specyfikacja projektu

## Koncept
SaaS / self-hosted platforma do zarządzania farmą drukarek 3D — od przyjęcia zlecenia po wysyłkę gotowego wydruku. Multi-tenant architektura.

---

## 🎯 Core Features

### 1. Upload & Auto-Wycena
- Klient wrzuca STL/3MF → auto-slicing (PrusaSlicer/OrcaSlicer CLI w Dockerze)
- Automatyczna wycena: czas druku × stawka + materiał (waga × cena/kg) + amortyzacja drukarki + marża
- Podgląd 3D modelu w przeglądarce (Three.js)
- Walidacja modelu (manifold check, rozmiar vs blat)

### 2. Fleet Management & Dashboard
- Live status każdej drukarki: idle / printing / error / maintenance
- Mapa farmy z wizualnym layoutem
- Historia awarii, success rate per drukarka
- Zarządzanie materiałami (stock filamentu, auto-alert przy niskim stanie)

### 3. Inteligentne Kolejkowanie & Scheduling
- Auto-assign zlecenia do wolnej drukarki (matching: materiał, rozmiar blatu, nozzle, jakość)
- Optymalizacja kolejki pod czas / materiał / priorytet
- Drag & drop priorytetów w UI
- ETA dla klienta w real-time

### 4. Live Monitoring & AI Quality Control
- Podgląd z kamer per drukarka (MJPEG/WebRTC)
- Progress %, temperatury, ETA w real-time (WebSockets)
- **AI spaghetti/warping detection** — YOLO/custom model, auto-pause
- Timelapse, powiadomienia (email/push/Discord webhook)

### 5. Panel Klienta
- Zamówienie → Stripe płatność → tracking statusu na żywo
- Historia zamówień, ponowne zamówienie jednym klikiem

### 6. Integracja E-commerce
- Plugin Shopify / WooCommerce — klient zamawia → auto-zlecenie
- API publiczne + webhooks

### 7. Multi-Tenant (SaaS)
- Row-level security w PostgreSQL
- Billing per tenant (Stripe subscriptions)
- Role: admin farmy / operator / klient

## 🔌 Integracje z drukarkami
- **Priorytet 1:** Klipper/Moonraker (REST + WS), OctoPrint (REST API)
- **Priorytet 2:** Bambu Lab (Cloud API), Prusa Connect (API)

## 🛠 Stack technologiczny
- **Frontend:** Next.js 15 + TypeScript + Tailwind + shadcn/ui
- **Backend:** Next.js API Routes (main) + FastAPI Python workers (slicing, AI)
- **DB:** PostgreSQL + Prisma ORM
- **Kolejki:** BullMQ + Redis
- **Real-time:** WebSockets
- **Slicing:** PrusaSlicer/OrcaSlicer CLI w Docker
- **3D Preview:** Three.js / React Three Fiber
- **AI/CV:** Python + YOLO
- **Płatności:** Stripe
- **Auth:** NextAuth.js / Clerk (multi-tenant)
- **Infra:** Docker Compose → K8s

## 🏗 Architektura
```
Frontend (Next.js) → Next.js API → PostgreSQL
                          ↓
                    Redis + BullMQ
                    ↓     ↓      ↓
              Slicing  AI/CV   Printer Bridge
              Worker   Worker     (Node)
              (Python) (Python)     ↓
                              Drukarki (LAN)
```

## 🚀 Fazy rozwoju

### Faza 1 — MVP (4-6 tyg)
Setup + Auth + Dashboard drukarek + Upload STL → slicing → wycena → start druku + Kolejka FIFO + Panel klienta + Stripe

### Faza 2 — Monitoring (2-3 tyg)
Live monitoring + kamery + alerty + timelapse

### Faza 3 — AI (3-4 tyg)
Spaghetti/warping detection + inteligentny scheduling + stock management

### Faza 4 — E-commerce (4+ tyg)
Shopify/WooCommerce plugin + API publiczne + marketplace modeli + K8s

## 🏆 Wyróżniki vs konkurencja
- ✅ Self-hosted + SaaS (nie jedno albo drugie)
- ✅ AI fail detection + auto-pause
- ✅ Auto-wycena z amortyzacją (nikt tego nie ma)
- ✅ E-commerce plugin (Shopify/Woo)
- ✅ Inteligentny auto-scheduling
- ✅ Open API-first
