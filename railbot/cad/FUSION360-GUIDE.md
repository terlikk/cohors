# RailBot — Instrukcja modelowania w Fusion 360

## Część 1: Płyta bazowa wózka (Carriage Base Plate)

**Materiał druku:** PETG, 3 ściany, 40% infill, 0.2mm layer height

```
Wymiary: 200mm × 150mm × 6mm (prostokąt)
```

**Otwory montażowe:**
- 8x otwór Ø5.2mm na śruby M5 — do mocowania rolek V-slot
  - 4 otwory na górnej krawędzi: odległość od krawędzi 15mm, rozstaw 170mm (symetrycznie)
  - 4 otwory na dolnej krawędzi: identycznie
  - Rozstaw góra-dół: 120mm (odpowiada rozstawowi profili 2040)

- 4x otwór Ø3.2mm na śruby M3 — do mocowania linear rail MGN12H
  - Linia środkowa (75mm od każdej krawędzi)
  - Rozstaw: zgodny z MGN12H (20mm od końców, 2 pary co 20mm)

- 2x otwór Ø5.2mm — mocowanie silnika NEMA17 (oś Y)
  - Na prawej krawędzi, wzór NEMA17: kwadrat 31mm × 31mm, centrowany

- 1x otwór Ø22mm (przejście wału) — środek wzoru NEMA17

**Kieszeń na nakrętkę T-nut:**
- Pod każdym otworem M5: kieszeń 10mm × 5.5mm × 3mm (na nakrętkę T-nut V-slot)

---

## Część 2: Widełki (Fork Arms) — 2 sztuki, lustrzane

**Materiał druku:** PETG, 4 ściany, 50% infill

```
Profil L-kształt:
- Dolna półka (nośna): 180mm × 20mm × 3mm
- Boczna ścianka (prowadząca): 180mm × 12mm × 3mm
- Fazowanie na końcu: 15mm × 45° (ułatwia wsunięcie pod płytę)
```

**Mocowanie:**
- Na końcu (strona wózka): 2x otwór Ø3.2mm, rozstaw 30mm
- Mocowane do wózka MGN12H śrubami M3

**Rozstaw widełek:** 160mm (między wewnętrznymi krawędziami)
- Dopasowany do typowej płyty spring steel (235mm Ender / 256mm Bambu — widełki sięgają pod krawędzie)

**Powierzchnia kontaktu:**
- Dolna półka: wklej pasek gumy silikonowej 2mm (antypoślizg)

---

## Część 3: Mocowanie silnika osi X (X Motor Mount)

**Materiał druku:** PETG, 4 ściany, 60% infill

```
Wymiary: 50mm × 50mm × 20mm (blok)
```

**Otwory:**
- 4x otwór Ø3.2mm — wzór NEMA17 (31mm × 31mm)
- 1x otwór Ø22mm — przejście wału
- 2x otwór Ø5.2mm — mocowanie do profilu V-slot (M5 + T-nut)

**Montaż:** Na lewym końcu szyny, silnik po prawej stronie wózka

---

## Część 4: Napinacz paska GT2 (Belt Tensioner)

**Materiał druku:** PETG

```
Wymiary: 40mm × 30mm × 15mm
```

**Elementy:**
- Otwór Ø3mm — na oś idlera GT2 (śruba M3×20)
- Szczelina na pasek GT2: 7mm × 2mm (przejście paska)
- 1x otwór M5 — ślizgowy (owalny 5mm × 12mm) do regulacji naciągu
- Mocowanie do profilu na prawym końcu szyny

---

## Część 5: Obudowa elektroniki (Electronics Enclosure)

**Materiał druku:** PLA lub PETG, 2 ściany, 20% infill

```
Wymiary zewnętrzne: 120mm × 90mm × 40mm
Grubość ścian: 2mm
```

**Wewnątrz:**
- Sloty mocujące na: ESP32-S3 DevKit, 2x TMC2209 (z radiatorem!), buck converter
- 4x otwory montażowe M3 w dnie (mocowanie do profilu lub ściany)
- Otwory na kable: 2x otwór Ø10mm na boku (wejście/wyjście kabli)
- Otwory wentylacyjne: kratka na bokach (TMC2209 się grzeją!)

**Pokrywa:**
- Snap-fit lub śruby M3
- Otwór na micro-USB ESP32 (do flashowania)

---

## Część 6: Rack na płyty — Odbiór (Dropoff Rack)

**Materiał druku:** PETG, 3 ściany, 40% infill

```
Wymiary bazowe: 280mm × 60mm × 200mm (W × D × H)
```

**Konstrukcja:**
- 2 pionowe ścianki boczne: 60mm × 200mm × 4mm
- Prowadnice na płyty: rowki co 15mm (głębokość 3mm, szerokość 1mm) — płyty wchodzą pionowo
- Dno nachylone 5° — płyty zsuwają się do przodu
- Pojemność: 8-10 płyt (rozstaw rowków 15mm)
- Na dole: otwór na czujnik optyczny (TCRT5000) — wykrywa "rack pełny"

**Montaż:** na prawym końcu szyny, na wysokości wózka

---

## Część 7: Rack na czyste płyty (Supply Rack)

**Identyczny jak Rack Odbiór** ale z dodatkiem:
- Sprężyna dociskowa (kupić: sprężyna ściskana Ø10mm × 60mm) — dociska stos płyt w stronę wyjścia
- Prowadnik sprężyny: tunel 12mm × 12mm w tylnej ściance

---

## Część 8: Mocowania czujników

### Uchwyt czujnika Halla (4 szt)
```
10mm × 10mm × 15mm bloczek
Otwór Ø5mm na czujnik SS49E
Otwór M3 do mocowania w rowku V-slot
```

### Uchwyt endstopa (4 szt)
```
L-kształt: 20mm × 15mm × 15mm
2x otwór Ø2.5mm — na śruby mikroswitcha
1x otwór M3 — mocowanie do profilu/wózka
```

---

## Kolejność modelowania w Fusion 360

1. **Zacznij od płyty bazowej** — to główna część, wszystko się do niej montuje
2. **Widełki** — proste, wydrukuj i sprawdź czy pasują do Twojej płyty drukarki
3. **Mocowanie silnika X** — potrzebne do testów ruchu
4. **Obudowa elektroniki** — możesz użyć tymczasowo breadboarda bez obudowy
5. **Racki** — na końcu, kiedy reszta działa

## Tips
- Eksportuj jako STL z dokładnością "High"
- Orientacja druku: płyta bazowa płasko, widełki na boku (najsilniejsze warstwy wzdłuż długości)
- Dodaj 0.2mm tolerancji na otwory (otwór Ø5.2mm dla śruby M5)
- Testuj dopasowanie rolek V-slot PRZED drukowaniem całości!
