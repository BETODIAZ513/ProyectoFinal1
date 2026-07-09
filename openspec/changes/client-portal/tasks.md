## 1. Backend: Identity and Role Setup

- [x] 1.1 Add the `Propietario` role to the default roles inside `DbInitializer.cs`.
- [x] 1.2 Implement the client account registration endpoint in `PetClinic.Api` verifying existing emails in the `Propietarios` table.
- [x] 1.3 Add custom JWT claims to include `PropietarioId` in tokens generated for the `Propietario` role.

## 2. Backend: Portal API Endpoints

- [x] 2.1 Create the `GetPetsForPortalQuery` and its handler in `PetClinic.Application` filtering by `PropietarioId`.
- [x] 2.2 Create the `PortalController` inside `PetClinic.Api/Controllers/Portal/` restricting all actions to the `Propietario` role and injecting the `PropietarioId` claim.
- [x] 2.3 Add query handlers in `PetClinic.Application` for fetching pet weight histories and hospitalization statuses for portal users.

## 3. Database Seeding Refinement

- [x] 3.1 Update `DbInitializer.cs` to seed test client portal user accounts linked to existing `Propietario` profiles.

## 4. Frontend: Mobile-First Portal Project

- [x] 4.1 Scaffold the new React/Vite project in `src/PetClinic.PortalWeb`.
- [x] 4.2 Configure routing, navigation menu (with Dashboard active, and placeholders for Book Appointment and Store disabled).
- [x] 4.3 Implement CSS variables in `index.css` for light/dark themes and add a dark mode toggle button.
- [x] 4.4 Implement portal dashboard: list of pets, detailed views for clinical/weight history, and cage status indicators.
- [x] 4.5 Add the new frontend service to the root `docker-compose.yml` file.

## 5. Verification: Integration and Unit Tests

- [x] 5.1 Implement unit tests in `PetClinic.Application.UnitTests` for the new portal query handlers.
- [x] 5.2 Implement integration tests in `PetClinic.IntegrationTests` verifying authentication, token scope checks, and public endpoint security.
