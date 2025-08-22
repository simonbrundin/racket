# Arkitekturdokument för "Plan"

## 1. Övergripande arkitektur

Systemet är utformat som en **monolithisk arkitektur** som körs i ett
Kubernetes-kluster. Detta förenklar utveckling och distribution i den initiala
fasen, samtidigt som den drar nytta av den befintliga infrastrukturen.

- **Frontend:** En enkel-sidig applikation (SPA) som renderar det visuella
  gränssnittet för både desktop och mobil.
- **Backend:** En enda applikation som hanterar all affärslogik, dataåtkomst och
  API-endpoints.

## 2. Teknikval

### Frontend (SPA)

- **Ramverk:** **React**. Med tanke på kravet på en komplex trädstruktur och
  dynamiska komponenter är React ett utmärkt val på grund av dess
  komponentbaserade arkitektur och effektiva state management.
- **State Management:** **Redux Toolkit**. Detta ger en robust och förutsägbar
  metod för att hantera applikationens tillstånd, vilket är nödvändigt för en
  komplex trädstruktur.

### Backend

- **Ramverk:** **Node.js med Express.js**. Detta ger en lättviktig och snabb
  lösning som är enkel att deploya och underhålla. Det passar även för en
  fullstack-utvecklare.
- **Databas:** **PostgreSQL**. Med tanke på de komplexa relationerna
  (förälder-barn) och att ett mål kan ha flera föräldrar och barn, är en
  relationell databas bäst lämpad för att hantera denna typ av graf-struktur.

## 3. API-design (RESTful API)

- **Endpoint:** `/api/goals`
  - `GET /api/goals`: Hämtar alla mål.
  - `GET /api/goals/{id}`: Hämtar ett specifikt mål och dess direkta föräldrar
    och barn.
  - `POST /api/goals`: Skapar ett nytt mål.
  - `PUT /api/goals/{id}`: Uppdaterar ett befintligt mål, inklusive att lägga
    till/ta bort förälder- och barnrelationer.
  - `DELETE /api/goals/{id}`: Raderar ett mål.
- **Datastruktur:**
  - Varje mål-objekt (`goal`) kommer att inkludera `id`, `title`, `image_url`,
    `icon_url`, `is_completed` och arrays som `parent_ids` och `child_ids`.

## 4. Infrastrukturintegration

- **Kubernetes (K8s) Cluster:** Den monolit som byggs med Node.js/Express.js
  kommer att paketeras i en Docker-container. Denna container kan sedan deployas
  som en `Deployment` i det befintliga Kubernetes-klustret.
- **Crossplane:** Eftersom infrastruktur som kod är ett krav, kommer Crossplane
  att användas för att hantera externa resurser. Specifikt kommer Crossplane att
  användas för att provisionera och hantera en PostgreSQL-databas-instans för
  applikationens beständiga lagring. Detta säkerställer att databasen
  konfigureras och skalas automatiskt baserat på definierade policyer.

## 5. Säkerhet

- **Autentisering:** Enkel JWT-baserad autentisering (JSON Web Tokens)
  rekommenderas för att skydda API-endpoints och verifiera att användaren är
  behörig.
