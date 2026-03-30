# 🏭 PrintFlow — Platforma do automatyzacji druków 3D

## Koncept

SaaS / self-hosted platforma do zarządzania farmą drukarek 3D — od przyjęcia zlecenia po wysyłkę gotowego wydruku. Multi-tenant architektura, gotowa na skalowanie.

---

## 🎯 Core Features

### 1. Upload & Auto-Wycena
- Klient wrzuca STL/3MF → automatyczny slicing (PrusaSlicer/OrcaSlicer CLI w Dockerze)
- Automatyczna wycena: czas druku × stawka + materiał (waga × cena/kg) + amortyzacja drukarki + marża
- Podgląd 3D modelu w przeglądarce (Three.js / React Three Fiber)
- Walidacja modelu (manifold check, rozmiar vs blat drukarki)

### 2. Fleet Management & Dashboard
- Live status każdej drukarki: idle / printing / error / maintenance
- Mapa farmy z wizualnym layoutem
- Historia awarii, success rate per drukarka
- Zarządzanie materiałami (stock filamentu, auto-alert przy niskim stanie)

### 3. Inteligentne Kolejkowanie & Scheduling
- Auto-assign zlecenia do wolnej drukarki (matching: materiał, rozmiar blatu, nozzle, jakość)
- Optymalizacja kolejki pod czas / materiał / priorytet
- Drag & drop priorytetów w UI
- ETA dla klienta w czasie rzeczywistym

### 4. Live Monitoring & AI Quality Control
- Podgląd z kamer per drukarka (stream MJPEG/WebRTC)
- Progress %, temperatury, ETA w real-time (WebSockets)
- **AI spaghetti/warping detection** — model CV (YOLO/custom) analizuje kamerę i auto-pauzuje druk przy wykryciu błędu
- Timelapse generowanie
- Powiadomienia: druk skończony, błąd, brak filamentu (email/push/Discord webhook)

### 5. Panel Klienta
- Złóż zamówienie → płatność (Stripe) → tracking statusu na żywo
- Historia zamówień, ponowne zamówienie jednym klikiem
- Wgląd w ETA i etap realizacji

### 6. Integracja E-commerce
- Plugin Shopify / WooCommerce — klient zamawia w sklepie → auto-zlecenie w PrintFlow
- API publiczne do integracji z dowolnym systemem
- Webhook na zmianę statusu zlecenia

### 7. Multi-Tenant (SaaS)
- Jedna instancja, wielu klientów
- Row-level security w PostgreSQL
- Billing per tenant (Stripe subscriptions)
- Role: admin farmy / operator / klient

---

## 🔌 Integracje z drukarkami

| Drukarka | Protokół | Status |
|---|---|---|
| Klipper / Moonraker | REST + WebSocket | Priorytet 1 |
| OctoPrint | REST API | Priorytet 1 |
| Bambu Lab | Bambu Cloud API | Priorytet 2 |
| Prusa Connect | Prusa API | Priorytet 2 |

---

## 🛠 Stack technologiczny

| Warstwa | Technologia |
|---|---|
| **Frontend** | Next.js 15 + TypeScript + Tailwind + shadcn/ui |
| **Backend API** | Next.js API Routes (main) + FastAPI Python workers (slicing, AI) |
| **Baza danych** | PostgreSQL + Prisma ORM |
| **Kolejki** | BullMQ + Redis |
| **Real-time** | WebSockets (Socket.io lub native WS) |
| **Slicing engine** | PrusaSlicer CLI / OrcaSlicer CLI w Docker |
| **3D Preview** | Three.js / React Three Fiber |
| **AI / CV** | Python + YOLO (spaghetti detection) |
| **Płatności** | Stripe (jednorazowe + subskrypcje) |
| **Auth** | NextAuth.js / Clerk (multi-tenant) |
| **Infra** | Docker Compose → K8s |
| **Monitoring** | Grafana + Prometheus (opcjonalnie) |

**Dlaczego hybryda Node + Python?**
- Next.js = szybki full-stack development, SSR, świetny DX
- Python workers = slicing CLI, AI/CV modele, ciężkie obliczenia — Python ma lepszy ekosystem do tego

---

## 🏗 Architektura

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Frontend   │────▶│  Next.js API │────▶│   PostgreSQL    │
│  (Next.js)   │     │   (main)     │     │   (+ Prisma)    │
└─────────────┘     └──────┬───────┘     └─────────────────┘
                           │
                    ┌──────▼───────┐
                    │  Redis +     │
                    │  BullMQ      │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Slicing  │ │ AI/CV    │ │ Printer  │
        │ Worker   │ │ Worker   │ │ Bridge   │
        │ (Python) │ │ (Python) │ │ (Node)   │
        └──────────┘ └──────────┘ └────┬─────┘
                                       │
                              ┌────────▼────────┐
                              │   Drukarki      │
                              │ (Klipper/Octo)  │
                              └─────────────────┘
```

---

## 🚀 Fazy rozwoju

### Faza 1 — MVP (4-6 tygodni)
- [ ] Setup projektu (Next.js + Prisma + Docker)
- [ ] Auth + multi-tenant foundation
- [ ] Dashboard z listą drukarek (Klipper/Moonraker API)
- [ ] Upload STL → slicing → wycena → start druku
- [ ] Podstawowa kolejka FIFO
- [ ] Panel klienta: zamówienie + tracking
- [ ] Stripe płatności

### Faza 2 — Monitoring (2-3 tygodnie)
- [ ] Live monitoring: progress, temperatury, ETA
- [ ] Kamery: podgląd MJPEG
- [ ] Alerty: email + webhook
- [ ] Timelapse

### Faza 3 — AI & Inteligencja (3-4 tygodnie)
- [ ] AI spaghetti/warping detection + auto-pause
- [ ] Inteligentny scheduling (nie tylko FIFO)
- [ ] Auto-wycena z amortyzacją
- [ ] Zarządzanie stockiem filamentu

### Faza 4 — E-commerce & Scale (4+ tygodnie)
- [ ] Plugin Shopify / WooCommerce
- [ ] API publiczne + dokumentacja
- [ ] Marketplace modeli (opcjonalnie)
- [ ] Kubernetes deployment

---

## 🏆 Co wyróżnia od konkurencji

| Feature | OctoFarm | Obico | SimplyPrint | **PrintFlow** |
|---|---|---|---|---|
| Self-hosted | ✅ | ❌ | ❌ | ✅ |
| SaaS multi-tenant | ❌ | ✅ | ✅ | ✅ |
| AI fail detection | ❌ | ✅ | ❌ | ✅ |
| Auto-wycena | ❌ | ❌ | ❌ | ✅ |
| E-commerce plugin | ❌ | ❌ | ❌ | ✅ |
| Auto-scheduling | ❌ | ❌ | Częściowo | ✅ |
| Open API | ❌ | Częściowo | ❌ | ✅ |

---

## 📁 Struktura projektu

```
printflow/
├── apps/
│   └── web/                 # Next.js frontend + API
│       ├── app/
│       │   ├── (auth)/      # Login, register
│       │   ├── (dashboard)/ # Main dashboard
│       │   ├── api/         # API routes
│       │   └── layout.tsx
│       ├── components/
│       ├── lib/
│       └── package.json
├── packages/
│   ├── db/                  # Prisma schema + migrations
│   ├── printer-bridge/      # Integracje z drukarkami
│   └── shared/              # Shared types + utils
├── workers/
│   ├── slicer/              # Python slicing worker
│   └── ai-monitor/          # Python AI/CV worker
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.web
│   ├── Dockerfile.slicer
│   └── Dockerfile.ai
├── docs/
├── README.md
└── turbo.json               # Turborepo config
```
