# 5. Specifikationer och Krav

### 5.1 User Story 3.1: Skapa trädstruktur

- **Skapa barn:** Användaren kan klicka på en "+"-symbol bredvid ett mål i
  trädlistan för att lägga till ett nytt barn (delmål).
- **Skapa förälder:** Inom ett måls detaljvy finns en sektion för "Föräldrar".
  Där kan användaren klicka på en "+"-symbol för att lägga till en förälder. En
  sökfunktion med "fuzzy finding" ska användas för att enkelt hitta och välja
  bland befintliga mål.
- **Validering:** Systemet ska förhindra att ett mål blir sin egen förfader
  (dvs. cykler i trädet är inte tillåtna).

### 5.2 User Story 3.3: Visuell layout

- **Visuellt innehåll:** När ett nytt mål skapas ska systemet automatiskt
  generera en bild och en ikon baserat på målets titel. Användaren ska sedan
  kunna klicka på dessa för att se fler alternativa bilder/ikoner. Om inget
  alternativ passar ska det finnas en sökfunktion för att hitta en passande
  bild/ikon.
- **Gränssnitt för navigering:** Trädstrukturen visualiseras som en hierarkisk
  lista. Föräldern fungerar som titeln på en sektion och dess barn listas
  nedanför. Bredvid varje barn ska det finnas en ikon som indikerar om det målet
  i sin tur har egna barn.