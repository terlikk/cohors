# User Stories — PrintFlow

## Persony

### 🧑‍🔧 Marek — Właściciel farmy (B2B)
- Ma 8 drukarek (mix Bambu, Prusa, Ender)
- Przyjmuje zlecenia przez FB Marketplace i Allegro — chaos
- Ręcznie wycenia każde zlecenie, gubi się w Excelu
- Chce: jedno miejsce, auto-wycena, profesjonalny panel dla klientów

### 👩‍💻 Anna — Klientka (B2C)
- Projektuje biżuterię, potrzebuje wydruki prototypów
- Nie ma drukarki, nie zna się na materiałach
- Chce: wrzucić plik, dostać cenę, zamówić, nie myśleć o reszcie

### 🏢 TechParts Sp. z o.o. — Firma (B2B)
- Zamawia 200 szt obudów miesięcznie
- Potrzebuje stałego dostawcy z powtarzalnością
- Chce: subscription, API, faktury, SLA

---

## User Stories — Właściciel farmy

### Rejestracja i onboarding
- **PF-001** Jako właściciel farmy, chcę się zarejestrować i wybrać typ konta "Farma", żeby uzyskać dostęp do panelu zarządzania.
- **PF-002** Jako właściciel, chcę dodać swoje drukarki (model, rozmiar blatu, nozzle, obsługiwane materiały), żeby system wiedział co mogę drukować.
- **PF-003** Jako właściciel, chcę skonfigurować cennik (stawka/h, cena materiału/kg, amortyzacja, marża), żeby auto-wycena działała poprawnie.
- **PF-004** Jako właściciel, chcę dostać unikalny link (`printflow.pl/farm/moja-nazwa`), żeby udostępnić go klientom.
- **PF-005** Jako właściciel, chcę spersonalizować profil (logo, banner, opis, lokalizacja, godziny pracy), żeby wyglądał profesjonalnie.

### Zarządzanie zleceniami
- **PF-010** Jako właściciel, chcę widzieć nowe zlecenia w dashboardzie z powiadomieniem, żeby szybko reagować.
- **PF-011** Jako właściciel, chcę zaakceptować lub odrzucić zlecenie (z powodem), żeby mieć kontrolę nad tym co drukuję.
- **PF-012** Jako właściciel, chcę przypisać zlecenie do konkretnej drukarki (ręcznie lub auto-assign), żeby zoptymalizować kolejkę.
- **PF-013** Jako właściciel, chcę zmienić priorytet zleceń w kolejce (drag & drop), żeby pilne zlecenia szły pierwsze.
- **PF-014** Jako właściciel, chcę widzieć historię wszystkich zleceń z filtrami (data, status, klient, kwota), żeby mieć pełen obraz.

### Dashboard drukarek
- **PF-020** Jako właściciel, chcę widzieć live status każdej drukarki (idle/printing/error/maintenance).
- **PF-021** Jako właściciel, chcę widzieć progress %, ETA, temperaturę każdego druku.
- **PF-022** Jako właściciel, chcę dostać alert gdy drukarka zgłosi błąd lub AI wykryje defekt.
- **PF-023** Jako właściciel, chcę widzieć podgląd z kamery każdej drukarki.
- **PF-024** Jako właściciel, chcę zarządzać materiałami (stock filamentu, auto-alert przy niskim stanie).

### Finanse
- **PF-030** Jako właściciel, chcę widzieć ile zarobiłem (dziennie/tygodniowo/miesięcznie) po odjęciu prowizji.
- **PF-031** Jako właściciel, chcę automatyczne wypłaty na konto przez Stripe Connect.
- **PF-032** Jako właściciel, chcę generować faktury/rachunki dla klientów.

---

## User Stories — Klient

### Zamawianie
- **PF-100** Jako klient, chcę wrzucić plik STL/3MF bez zakładania konta i natychmiast zobaczyć wycenę.
- **PF-101** Jako klient, chcę wybrać materiał, kolor, jakość druku i zobaczyć jak zmienia się cena.
- **PF-102** Jako klient, chcę podać ile sztuk potrzebuję i zobaczyć cenę zbiorczą z rabatem ilościowym.
- **PF-103** Jako klient, chcę zobaczyć estimated time (ile potrwa druk) z uwzględnieniem równoległego druku na wielu drukarkach.
- **PF-104** Jako klient, chcę wybrać opcję szybkości: Standard / Express (+30%) / Rush (+50%).
- **PF-105** Jako klient, chcę zobaczyć podgląd 3D mojego modelu przed zamówieniem.
- **PF-106** Jako klient, chcę zapłacić kartą lub BLIK przez Stripe.
- **PF-107** Jako klient, chcę założyć konto dopiero przy składaniu zamówienia (nie wcześniej).

### Marketplace
- **PF-110** Jako klient, chcę przeglądać farmy na marketplace z filtrami (lokalizacja, materiał, cena, ocena).
- **PF-111** Jako klient, chcę zobaczyć farmy na mapie posortowane po odległości od mojej lokalizacji.
- **PF-112** Jako klient, chcę porównać wyceny z kilku farm dla tego samego pliku naraz.
- **PF-113** Jako klient, chcę widzieć oceny i recenzje farm przed zamówieniem.
- **PF-114** Jako klient, chcę zobaczyć galerię realizacji farmy (portfolio).

### Tracking
- **PF-120** Jako klient, chcę śledzić status zamówienia na żywo (w kolejce → drukuje → gotowe → wysłane).
- **PF-121** Jako klient, chcę oglądać live stream z kamery jak mój wydruk powstaje.
- **PF-122** Jako klient, chcę dostać powiadomienie (email/push) gdy zamówienie zmieni status.
- **PF-123** Jako klient, chcę zamówić ponownie to samo jednym klikiem (re-order).
- **PF-124** Jako klient, chcę ocenić farmę i zostawić recenzję po otrzymaniu zamówienia.

---

## User Stories — Firma (subscription)

- **PF-200** Jako firma, chcę zamówić stałą dostawę X sztuk miesięcznie (subscription).
- **PF-201** Jako firma, chcę integrację API żeby zamawiać z mojego systemu ERP.
- **PF-202** Jako firma, chcę rabat ilościowy naliczany automatycznie.
- **PF-203** Jako firma, chcę faktury VAT generowane automatycznie.
- **PF-204** Jako firma, chcę dedykowanego opiekuna/farmę z SLA.
