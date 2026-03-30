# Stack Technologiczny — PrintFlow

## Frontend
| Technologia | Rola | Dlaczego |
|-------------|------|----------|
| **Next.js 15** | Framework | SSR + API routes, App Router, szybkie SEO |
| **TypeScript** | Język | Type safety, mniej bugów |
| **Tailwind CSS** | Styling | Szybki development, spójny design |
| **shadcn/ui** | Komponenty | Piękne, customizowalne, accessible |
| **Three.js / R3F** | 3D Preview | Podgląd modeli STL w przeglądarce |
| **Mapbox GL** | Mapy | Mapa farm z GPS |
| **Framer Motion** | Animacje | Smooth UI transitions |

## Backend
| Technologia | Rola | Dlaczego |
|-------------|------|----------|
| **Next.js API Routes** | REST API | Jedno repo, zero konfiguracji |
| **Prisma ORM** | Database | Type-safe queries, migracje, schema-first |
| **PostgreSQL** | Baza danych | RLS, JSONB, GiST indeksy (geo), sprawdzony |
| **Redis** | Cache + kolejki | Szybki, BullMQ potrzebuje |
| **BullMQ** | Job queue | Slicing jobs, AI jobs, async processing |

## Workers (Python)
| Technologia | Rola | Dlaczego |
|-------------|------|----------|
| **FastAPI** | Worker API | Szybki Python framework |
| **PrusaSlicer CLI** | Slicing | Najlepszy open-source slicer, Docker-friendly |
| **OrcaSlicer CLI** | Slicing alt | Alternatywa, lepsze profile Bambu |
| **YOLO v8** | AI QC | Spaghetti/warping detection |
| **OpenCV** | Image processing | Przetwarzanie klatek z kamer |

## Płatności
| Technologia | Rola | Dlaczego |
|-------------|------|----------|
| **Stripe Checkout** | Płatności | Karta + BLIK, PCI compliant |
| **Stripe Connect** | Split płatności | Auto-prowizja, wypłaty do farm |
| **Stripe Billing** | Subscriptions | Stałe zamówienia, subskrypcje Pro |

## Auth
| Technologia | Rola | Dlaczego |
|-------------|------|----------|
| **NextAuth.js** | Auth | Email/hasło + Google OAuth, session management |
| **lub Clerk** | Auth alt | Multi-tenant ready, lepszy UX, droższy |

## Real-time
| Technologia | Rola | Dlaczego |
|-------------|------|----------|
| **WebSockets** | Live data | Status drukarek, tracking zamówień |
| **MJPEG / WebRTC** | Camera streams | Podgląd z kamer drukarek |

## Integracje drukarek
| API | Drukarki | Protokół |
|-----|----------|----------|
| **Klipper/Moonraker** | Custom + Voron | REST + WebSocket |
| **OctoPrint** | Większość FDM | REST API |
| **Bambu Lab Cloud** | X1C, P1S, A1 | Cloud REST API |
| **Prusa Connect** | MK4, XL, Mini | REST API |

## Infra
| Technologia | Rola | Dlaczego |
|-------------|------|----------|
| **Docker Compose** | Dev + small prod | Proste, jedno `docker-compose up` |
| **Vercel** | Frontend hosting | Auto-deploy, edge, preview URLs |
| **Railway / Fly.io** | Workers + Redis | Python workers, PostgreSQL |
| **AWS S3 / Cloudflare R2** | File storage | STL files, renders, galeria |
| **Kubernetes** | Enterprise scale | Opcjonalnie dla dużych wdrożeń |

## Monitoring
| Technologia | Rola |
|-------------|------|
| **Sentry** | Error tracking |
| **PostHog / Plausible** | Analytics |
| **Uptime Kuma** | Uptime monitoring |

---

## Architektura

```
┌──────────────────────────────────┐
│         Next.js Frontend         │
│    (SSR + Client Components)     │
└──────────┬───────────────────────┘
           │
┌──────────▼───────────────────────┐
│       Next.js API Routes         │
│  (REST + WebSocket upgrade)      │
└──────┬──────────┬────────────────┘
       │          │
┌──────▼──┐  ┌───▼──────────┐
│PostgreSQL│  │ Redis+BullMQ │
│ (Prisma) │  │              │
└──────────┘  └──┬─────┬────┘
                 │     │
          ┌──────▼─┐ ┌─▼────────┐
          │Slicing  │ │AI/CV     │
          │Worker   │ │Worker    │
          │(Python) │ │(Python)  │
          └─────────┘ └──────────┘
                         │
              ┌──────────▼──────────┐
              │   Printer Bridge    │
              │   (Node.js)         │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │  Drukarki (LAN)     │
              │  Klipper/OctoPrint  │
              │  Bambu/Prusa        │
              └─────────────────────┘
```
