# Database Schema — PrintFlow

## Tabele

### users
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID PK | |
| email | VARCHAR UNIQUE | |
| password_hash | VARCHAR | |
| full_name | VARCHAR | |
| avatar_url | VARCHAR | |
| role | ENUM | `client`, `farm_owner`, `admin` |
| phone | VARCHAR | |
| location_lat | DECIMAL | GPS latitude |
| location_lng | DECIMAL | GPS longitude |
| city | VARCHAR | |
| stripe_customer_id | VARCHAR | Stripe customer ID |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### farms
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID PK | |
| owner_id | UUID FK → users | |
| name | VARCHAR | Nazwa farmy |
| slug | VARCHAR UNIQUE | URL: printflow.pl/farm/{slug} |
| description | TEXT | Opis farmy |
| logo_url | VARCHAR | |
| banner_url | VARCHAR | |
| location_lat | DECIMAL | |
| location_lng | DECIMAL | |
| city | VARCHAR | |
| address | VARCHAR | Adres (dla odbioru osobistego) |
| working_hours | JSONB | `{"mon": "8-18", "tue": "8-18", ...}` |
| is_verified | BOOLEAN | Badge "Verified Farm" |
| is_active | BOOLEAN | Czy widoczna na marketplace |
| rating_avg | DECIMAL | Średnia ocena |
| rating_count | INTEGER | Ilość ocen |
| total_orders | INTEGER | Łączna ilość zleceń |
| stripe_account_id | VARCHAR | Stripe Connect account |
| commission_rate | DECIMAL | Prowizja PrintFlow (default 0.07 = 7%) |
| created_at | TIMESTAMP | |

### printers
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID PK | |
| farm_id | UUID FK → farms | |
| name | VARCHAR | "Bambu X1C #1" |
| model | VARCHAR | Model drukarki |
| build_volume_x | INTEGER | mm |
| build_volume_y | INTEGER | mm |
| build_volume_z | INTEGER | mm |
| nozzle_diameter | DECIMAL | mm (0.4, 0.6, 0.8) |
| supported_materials | TEXT[] | `["PLA", "PETG", "ABS"]` |
| status | ENUM | `idle`, `printing`, `error`, `maintenance`, `offline` |
| camera_url | VARCHAR | MJPEG/WebRTC stream URL |
| api_type | ENUM | `klipper`, `octoprint`, `bambu`, `prusa_connect` |
| api_url | VARCHAR | Endpoint drukarki |
| api_key | VARCHAR | Encrypted |
| hourly_rate | DECIMAL | Stawka zł/h |
| depreciation_rate | DECIMAL | Amortyzacja zł/h |
| success_rate | DECIMAL | % udanych druków |
| total_hours | DECIMAL | Łączne godziny druku |
| created_at | TIMESTAMP | |

### materials
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID PK | |
| farm_id | UUID FK → farms | |
| type | VARCHAR | PLA, PETG, ABS, TPU, Nylon... |
| color | VARCHAR | |
| brand | VARCHAR | |
| price_per_kg | DECIMAL | zł/kg |
| stock_grams | INTEGER | Stan magazynowy w gramach |
| low_stock_alert | INTEGER | Alert gdy poniżej (gramy) |
| created_at | TIMESTAMP | |

### orders
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID PK | |
| order_number | VARCHAR UNIQUE | PF-2026-00001 |
| client_id | UUID FK → users | |
| farm_id | UUID FK → farms | |
| status | ENUM | `pending`, `accepted`, `queued`, `printing`, `completed`, `shipped`, `delivered`, `cancelled`, `rejected` |
| priority | ENUM | `standard`, `express`, `rush` |
| total_price | DECIMAL | Cena całkowita |
| commission_amount | DECIMAL | Prowizja PrintFlow |
| farm_payout | DECIMAL | Wypłata dla farmy |
| shipping_method | ENUM | `pickup`, `courier`, `inpost` |
| shipping_cost | DECIMAL | |
| shipping_tracking | VARCHAR | Numer śledzenia |
| notes | TEXT | Notatki klienta |
| rejection_reason | TEXT | Powód odrzucenia |
| stripe_payment_id | VARCHAR | |
| paid_at | TIMESTAMP | |
| accepted_at | TIMESTAMP | |
| completed_at | TIMESTAMP | |
| shipped_at | TIMESTAMP | |
| delivered_at | TIMESTAMP | |
| created_at | TIMESTAMP | |

### order_items
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID PK | |
| order_id | UUID FK → orders | |
| file_name | VARCHAR | Oryginalna nazwa pliku |
| file_url | VARCHAR | URL w storage |
| file_size | INTEGER | Bytes |
| thumbnail_url | VARCHAR | Podgląd 3D render |
| material_id | UUID FK → materials | |
| quality | ENUM | `draft`, `standard`, `high` |
| quantity | INTEGER | Ile sztuk |
| price_per_unit | DECIMAL | Cena za sztukę |
| discount_percent | DECIMAL | Rabat ilościowy |
| subtotal | DECIMAL | quantity × price_per_unit × (1 - discount) |
| estimated_time_min | INTEGER | Szacowany czas druku (minuty) na 1 szt |
| slicing_data | JSONB | Dane z slicera (czas, waga, warstwy) |
| printer_id | UUID FK → printers | Przypisana drukarka |
| print_started_at | TIMESTAMP | |
| print_finished_at | TIMESTAMP | |

### reviews
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID PK | |
| order_id | UUID FK → orders | |
| client_id | UUID FK → users | |
| farm_id | UUID FK → farms | |
| rating | INTEGER | 1-5 |
| comment | TEXT | |
| photos | TEXT[] | URL zdjęć |
| created_at | TIMESTAMP | |

### farm_gallery
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID PK | |
| farm_id | UUID FK → farms | |
| image_url | VARCHAR | |
| title | VARCHAR | |
| description | TEXT | |
| created_at | TIMESTAMP | |

### messages
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID PK | |
| order_id | UUID FK → orders | |
| sender_id | UUID FK → users | |
| body | TEXT | |
| attachments | TEXT[] | |
| read_at | TIMESTAMP | |
| created_at | TIMESTAMP | |

### subscriptions
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID PK | |
| client_id | UUID FK → users | |
| farm_id | UUID FK → farms | |
| order_item_template | JSONB | Szablon zamówienia (plik, materiał, ilość) |
| frequency | ENUM | `weekly`, `biweekly`, `monthly` |
| quantity | INTEGER | |
| discount_percent | DECIMAL | Rabat subscription |
| next_order_date | DATE | |
| is_active | BOOLEAN | |
| stripe_subscription_id | VARCHAR | |
| created_at | TIMESTAMP | |

### notifications
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID PK | |
| user_id | UUID FK → users | |
| type | VARCHAR | `new_order`, `status_change`, `ai_alert`, `low_stock`, `review` |
| title | VARCHAR | |
| body | TEXT | |
| data | JSONB | Kontekstowe dane |
| read_at | TIMESTAMP | |
| created_at | TIMESTAMP | |

---

## Indeksy
- `orders.client_id` + `orders.status`
- `orders.farm_id` + `orders.status`
- `farms.slug` UNIQUE
- `farms.location_lat, location_lng` (GiST dla zapytań geolokacyjnych)
- `printers.farm_id` + `printers.status`
- `order_items.order_id`
- `reviews.farm_id`
- `messages.order_id` + `messages.created_at`

## Row-Level Security (multi-tenant)
- Właściciel farmy widzi tylko swoje dane (farm_id match)
- Klient widzi tylko swoje zamówienia (client_id match)
- Marketplace: farmy z `is_active = true` widoczne publicznie
- Admin: pełen dostęp
