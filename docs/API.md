# API Endpoints — PrintFlow

## Auth
| Method | Endpoint | Opis |
|--------|----------|------|
| POST | `/api/auth/register` | Rejestracja (client / farm_owner) |
| POST | `/api/auth/login` | Logowanie |
| POST | `/api/auth/google` | Google OAuth |
| POST | `/api/auth/reset-password` | Reset hasła |
| GET | `/api/auth/me` | Aktualny user |

## Farmy (publiczne)
| Method | Endpoint | Opis |
|--------|----------|------|
| GET | `/api/farms` | Lista farm (marketplace) — filtry: location, material, rating |
| GET | `/api/farms/:slug` | Profil farmy (publiczny) |
| GET | `/api/farms/:slug/gallery` | Galeria realizacji |
| GET | `/api/farms/:slug/reviews` | Recenzje farmy |
| GET | `/api/farms/nearby?lat=X&lng=Y&radius=50` | Farmy w okolicy (GPS) |

## Farmy (panel właściciela) — wymaga auth + role=farm_owner
| Method | Endpoint | Opis |
|--------|----------|------|
| PUT | `/api/farm/profile` | Edycja profilu farmy |
| POST | `/api/farm/gallery` | Dodaj zdjęcie do galerii |
| DELETE | `/api/farm/gallery/:id` | Usuń zdjęcie |
| GET | `/api/farm/stats` | Statystyki (zarobki, zlecenia, rating) |
| GET | `/api/farm/payouts` | Historia wypłat Stripe Connect |

## Drukarki — wymaga auth + farm_owner
| Method | Endpoint | Opis |
|--------|----------|------|
| GET | `/api/farm/printers` | Lista drukarek farmy |
| POST | `/api/farm/printers` | Dodaj drukarkę |
| PUT | `/api/farm/printers/:id` | Edytuj drukarkę |
| DELETE | `/api/farm/printers/:id` | Usuń drukarkę |
| GET | `/api/farm/printers/:id/status` | Live status (WS upgrade available) |
| GET | `/api/farm/printers/:id/camera` | Stream z kamery |

## Materiały — wymaga auth + farm_owner
| Method | Endpoint | Opis |
|--------|----------|------|
| GET | `/api/farm/materials` | Lista materiałów |
| POST | `/api/farm/materials` | Dodaj materiał |
| PUT | `/api/farm/materials/:id` | Edytuj (cena, stock) |
| DELETE | `/api/farm/materials/:id` | Usuń |

## Wycena (publiczny!)
| Method | Endpoint | Opis |
|--------|----------|------|
| POST | `/api/quote` | Upload STL + parametry → natychmiastowa wycena |
| POST | `/api/quote/multi` | Upload STL → wycena z wielu farm naraz |

### POST `/api/quote` — request
```json
{
  "file": "<binary STL/3MF>",
  "farm_slug": "moja-farma",
  "material": "PLA",
  "color": "black",
  "quality": "standard",
  "quantity": 10
}
```

### POST `/api/quote` — response
```json
{
  "model": {
    "name": "bracket.stl",
    "dimensions": {"x": 45, "y": 30, "z": 20},
    "volume_cm3": 12.5,
    "is_valid": true,
    "thumbnail_url": "/tmp/preview_abc123.png"
  },
  "pricing": {
    "print_time_min": 47,
    "material_grams": 18.5,
    "price_per_unit": 45.00,
    "quantity": 10,
    "discount_percent": 5,
    "subtotal": 427.50,
    "shipping_estimate": 15.00,
    "total": 442.50
  },
  "estimated_time": {
    "standard": {"hours": 14, "label": "~14h (3 drukarki równolegle)"},
    "express": {"hours": 8, "surcharge_percent": 30},
    "rush": {"hours": 4, "surcharge_percent": 50}
  },
  "available_materials": ["PLA", "PETG", "ABS"],
  "available_colors": ["black", "white", "red", "blue", "green"]
}
```

## Zamówienia
| Method | Endpoint | Opis |
|--------|----------|------|
| POST | `/api/orders` | Złóż zamówienie (po wycenie) |
| GET | `/api/orders` | Moje zamówienia (client) |
| GET | `/api/orders/:id` | Szczegóły zamówienia |
| GET | `/api/orders/:id/tracking` | Live tracking status |
| POST | `/api/orders/:id/reorder` | Zamów ponownie |

## Zamówienia (panel farmy)
| Method | Endpoint | Opis |
|--------|----------|------|
| GET | `/api/farm/orders` | Zlecenia farmy (filtry: status, data) |
| PUT | `/api/farm/orders/:id/accept` | Akceptuj zlecenie |
| PUT | `/api/farm/orders/:id/reject` | Odrzuć (z powodem) |
| PUT | `/api/farm/orders/:id/assign` | Przypisz do drukarki |
| PUT | `/api/farm/orders/:id/status` | Zmień status |
| PUT | `/api/farm/orders/:id/shipping` | Dodaj tracking number |

## Chat
| Method | Endpoint | Opis |
|--------|----------|------|
| GET | `/api/orders/:id/messages` | Wiadomości w zamówieniu |
| POST | `/api/orders/:id/messages` | Wyślij wiadomość |

## Recenzje
| Method | Endpoint | Opis |
|--------|----------|------|
| POST | `/api/orders/:id/review` | Dodaj recenzję (po delivered) |

## Subscriptions
| Method | Endpoint | Opis |
|--------|----------|------|
| POST | `/api/subscriptions` | Utwórz subscription |
| GET | `/api/subscriptions` | Moje subscriptions |
| PUT | `/api/subscriptions/:id` | Edytuj (ilość, częstotliwość) |
| DELETE | `/api/subscriptions/:id` | Anuluj |

## Płatności
| Method | Endpoint | Opis |
|--------|----------|------|
| POST | `/api/payments/checkout` | Utwórz Stripe Checkout session |
| POST | `/api/payments/webhook` | Stripe webhook (checkout.completed) |
| POST | `/api/payments/connect/onboard` | Onboarding farmy do Stripe Connect |

## WebSocket
| Endpoint | Opis |
|----------|------|
| `ws://api/ws/printer/:id` | Live status drukarki |
| `ws://api/ws/order/:id` | Live tracking zamówienia |
| `ws://api/ws/farm/orders` | Nowe zlecenia (real-time) |

## Notifications
| Method | Endpoint | Opis |
|--------|----------|------|
| GET | `/api/notifications` | Lista powiadomień |
| PUT | `/api/notifications/:id/read` | Oznacz jako przeczytane |
| POST | `/api/notifications/push/register` | Rejestracja push token |
