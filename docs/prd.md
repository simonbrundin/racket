# Produktkravdokument (PRD) för "Plan"

## 1. Introduktion

### 1.1 Projektets namn: Plan

### 1.2 Översikt

Plan är en planeringsapp designad för att hjälpa användare att hålla reda på
sina livsmål. Applikationen har en central funktion som låter användaren
visualisera sina mål i en flexibel trädstruktur, där varje mål kan ha flera
föräldrar och flera barn. Appen kommer även att erbjuda funktionalitet för att
prioritera uppgifter och skapa dagliga samt långsiktiga planer.

### 1.3 Målgrupp

Individer som vill organisera och uppnå sina personliga och professionella mål.

## 2. Affärsmål

### 2.1 Affärsmål 1

Skapa ett internt verktyg som exakt uppfyller användarens (din) egna behov och
specifikationer.

### 2.2 Affärsmål 2

Formulera och kommunicera applikationens värde och nytta på ett tydligt sätt.

### 2.3 Affärsmål 3

Leverera en minimalt användbar produkt (MVP) snabbt för att tidigt kunna
validera funktionaliteten och skapa omedelbart värde.

## 3. Användarberättelser (User Stories)

### 3.1

Som en användare vill jag kunna strukturera upp mitt liv och dess mål i en
trädstruktur där varje mål kan ha både flera föräldrar och flera barn i oändligt
många steg.

### 3.2

Som en användare vill jag kunna lägga till nya mål och organisera in dem i
trädet på ett enkelt sätt, helst både via text och ljud.

### 3.3

Som en användare vill jag att applikationen ska vara väldigt visuell med bilder
eller ikoner för varje mål så det är enklare att överblicka vad som ska utföras.

### 3.4

Som en användare vill jag kunna få hjälp att skapa planer för hur jag ska uppnå
mina mål. De planerna ska sedan bli till delmål (barn) som ifall de behövs även
de bryts ner i fler steg (barnbarn) osv.

### 3.5

Som en användare vill jag kunna se en kalender för att kunna planera in när jag
ska lägga tid på olika mål.

## 4. Prioritering och "Feature Matrix"

| User Story | Värde (1-5) | Insats (1-5) | Osäkerhet (1-5) | Total Poäng (Värde / (Insats + Osäkerhet)) | Prioritet  |
| :--------- | :---------- | :----------- | :-------------- | :----------------------------------------- | :--------- |
| **3.1**    | 5           | 2            | 2               | **1.25**                                   | **Högst**  |
| **3.3**    | 4           | 2            | 2               | **1.00**                                   | **Hög**    |
| **3.5**    | 5           | 4            | 4               | **0.625**                                  | **Medium** |
| **3.4**    | 4           | 4            | 4               | **0.50**                                   | **Låg**    |
| **3.2**    | 2           | 4            | 3               | **0.28**                                   | **Lägst**  |

## 5. Specifikationer och Krav

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

## 6. Funktionella Krav

Se Användarberättelser (avsnitt 3).

## 7. Icke-funktionella Krav

- **Plattform:** Webbapplikation optimerad för både datorer och mobiltelefoner.
- **Arkitektur:** Applikationen ska distribueras och hanteras i ett befintligt
  Kubernetes-kluster.
- **Infrastruktur:** Applikationen ska använda Crossplane för att hantera sin
  infrastruktur som kod.
