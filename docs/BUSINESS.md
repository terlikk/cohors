# Model Biznesowy — PrintFlow

## Źródła przychodów

### 1. Prowizja od transakcji (główne źródło)
- **7% od każdego zamówienia** przez marketplace
- Stripe Connect automatycznie rozdziela: 93% → farma, 7% → PrintFlow
- Przy zamówieniach bezpośrednich (przez link farmy): **5%**
- Szacunek: 1000 zamówień/msc × średnia 150 zł × 7% = **10 500 zł/msc**

### 2. Subskrypcja Pro (za automatyzację — marketplace ZAWSZE za darmo)
| Plan | Cena | Marketplace | Menedżer |
|------|------|-------------|----------|
| **Free** | 0 zł/msc | ✅ Profil, zlecenia, auto-wycena, panel zamówień | 3 drukarki, ręczne statusy |
| **Pro** | 149 zł/msc | ✅ Wszystko z Free + widget embed, galeria, featured | 20 drukarek, integracja API (Klipper/OctoPrint/Bambu/Prusa), live monitoring + kamery, AI QC, smart scheduling, stock management, analytics |
| **Enterprise** | 499 zł/msc | ✅ Wszystko z Pro | ∞ drukarek, **Autopilot (full autonomous mode)**, auto-eject, continuous queue, API publiczne, self-hosted, SLA, maintenance scheduler, power monitoring |

**Kluczowa decyzja:** Marketplace za darmo dla wszystkich — buduje efekt sieciowy. Płatne są narzędzia automatyzacji (Pro/Enterprise).

**Autopilot (Enterprise)** — USP którego nikt na rynku nie ma:
Klient zamawia → auto-weryfikacja → auto-accept → auto-slicing → auto-assign → auto-start → AI monitoring → auto-eject → następny druk. Jedyny człowiek = pakowanie i wysyłka.

### 3. Featured Listing
- Farma płaci za **wyróżnienie na marketplace**: 99 zł/msc
- Wyższa pozycja w wyszukiwaniu, badge "Featured", większa karta

### 4. Express/Rush surcharge
- PrintFlow bierze dodatkowe 2% z surcharge za Express/Rush
- Express: +30% ceny → 2% z tego idzie do PrintFlow
- Rush: +50% ceny → 2% z tego idzie do PrintFlow

### Jak płatności działają (Stripe Connect)
1. Klient klika "Zapłać" → Stripe Checkout (karta / BLIK / P24)
2. Stripe automatycznie dzieli: prowizja → konto PrintFlow, reszta → konto farmy
3. Zero ręcznych przelewów — split w momencie płatności
4. Farma dostaje wypłaty na konto bankowe: co tydzień (auto) lub na żądanie

**Przykład zamówienia 500 zł:**
```
Klient płaci:              500.00 zł
Stripe fee (2.9% + 1 zł): -15.50 zł
PrintFlow prowizja (7%):   -35.00 zł
Farma dostaje:             449.50 zł
```

---

## Koszty

| Pozycja | Szacunek/msc |
|---------|-------------|
| Hosting (Vercel/Railway) | 100-500 zł |
| Supabase/DB | 100-300 zł |
| Stripe fees (2.9% + 1 zł) | Przerzucone na klienta |
| Slicing workers (Docker) | 200-500 zł |
| AI model hosting | 300-800 zł |
| Domena + DNS | 50 zł/rok |
| Marketing | 1000-3000 zł |

## Break-even
- Przy 200 zamówieniach/msc × 150 zł avg × 7% = 2100 zł prowizji
- \+ 10 farm na Pro × 149 zł = 1490 zł
- **~3600 zł/msc** przy minimalnej skali → pokrywa koszty

## Skalowanie
- Marketplace efekt sieciowy: więcej farm → więcej klientów → więcej farm
- Każda nowa farma = darmowe zwiększenie "inventory"
- Kalkulator opłacalności = narzędzie growth do wciągania farm
- Widget embed = farmy promują PrintFlow na swoich stronach za darmo

---

## Konkurencja

| Konkurent | Co robią | Czego im brakuje |
|-----------|----------|-----------------|
| **Craftcloud / All3DP** | Marketplace druku 3D | Brak zarządzania farmą, brak live monitoring |
| **3D Hubs (Protolabs)** | Enterprise druk 3D | Drogie, brak self-hosted, brak małych farm |
| **SimplyPrint** | Dashboard drukarek | Brak marketplace, brak e-commerce |
| **OctoPrint/Klipper** | Kontrola drukarki | Zero biznesu, zero klientów, zero wycen |
| **Repetier Server** | Multi-printer mgmt | Brak marketplace, stary UI |

**PrintFlow = jedyny który łączy marketplace + zarządzanie farmą + AI QC w jednym.**

---

## Metryki sukcesu (KPI)

| Metryka | Target 3 msc | Target 12 msc |
|---------|-------------|---------------|
| Zarejestrowane farmy | 50 | 500 |
| Aktywne farmy (≥1 zlecenie/msc) | 20 | 200 |
| Zamówienia/msc | 200 | 5000 |
| GMV (obrót) | 30 000 zł | 750 000 zł |
| Przychód PrintFlow | 3 600 zł | 75 000 zł |
| Avg order value | 150 zł | 150 zł |
| Farmy Pro | 10 | 100 |

---

## Go-to-market

### Faza 1: Lokalna (0-3 msc)
- Znajdź 10-20 farm ręcznie (FB grupy, Allegro sprzedawcy druku 3D)
- Daj im Free tier + onboarding pomoc
- Kalkulator opłacalności jako landing page
- Content marketing: "Jak zarobić na drukarce 3D"

### Faza 2: Organiczna (3-6 msc)
- SEO: "druk 3D na zamówienie", "wydruki 3D online"
- Widget embed = farmy reklamują PrintFlow na swoich stronach
- Referral program: farma poleca farmę = 10% z prowizji przez 3 msc

### Faza 3: Skala (6-12 msc)
- Google Ads, FB Ads
- Partnership z producentami filamentów (Prusa, Fiberlogy)
- API dla firm B2B
- Ekspansja: Polska → EU
