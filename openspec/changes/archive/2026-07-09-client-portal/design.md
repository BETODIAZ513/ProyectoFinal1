## Context

The current system has a back-office SPA (`PetClinic.Web`) for staff and a shared Web API (`PetClinic.Api`). To allow clients (pet owners) to access their pets' information on mobile viewports, we will introduce a new mobile-first React SPA (`PetClinic.PortalWeb`) in the same git repository and add a dedicated `/api/portal/` controller route namespace in the backend.

## Goals / Non-Goals

**Goals:**
- Provide a secure, mobile-friendly client dashboard for pet owners.
- Allow clients to view read-only data for their pets: basic profile, weight tracking history, medical history, and cage/hospitalization status.
- Support a dark/light mode toggle in the portal frontend.
- Implement a responsive navigation menu with placeholders for future features (Online Booking and Store).

**Non-Goals:**
- Implementing the actual appointment booking form or store pages in this phase.
- Allowing clients to register accounts with emails not previously registered by staff at the clinic.
- Providing write/edit access to medical records, weights, or hospitalization states from the portal.

## Decisions

- **Decision 1: Separate Frontend Application (`PetClinic.PortalWeb`)**
  - *Rationale*: Isolates administrative code, routing, and modules from the client-facing codebase. Keeps bundle sizes light and optimized for mobile performance.
- **Decision 2: Token-Scoped API Queries**
  - *Rationale*: The backend JWT generation will include the `PropietarioId` claim for users authenticated with the `Propietario` role. All `/api/portal/` endpoints will retrieve this claim from `HttpContext.User` to filter queries (e.g., `WHERE PropietarioId = currentPropietarioId`).
- **Decision 3: Dark/Light Mode via Vanilla CSS Variables**
  - *Rationale*: To align with the project styling architecture, the portal theme will be managed via CSS variables (e.g., `--bg-primary`, `--text-primary`) defined in `index.css` and toggled by adding/removing a `.dark` class on the `<html>` or `<body>` element. Preference will be persisted in `localStorage`.
- **Decision 4: Scoped Data Mapping**
  - *Rationale*: Prevent leak of internal clinical logs. The query handlers returning pet clinical records will map only safe public fields (`FechaAtencion`, `Diagnostico`, `Tratamiento`) to DTOs, omitting internal vet notes if they exist.

## Risks / Trade-offs

- **[Risk]** Clients guessing API IDs to view other clients' pets.
  - *Mitigation*: Ensure all portal API queries strictly filter on the verified `PropietarioId` claim from the JWT, rather than trusting client-provided route parameters.
- **[Risk]** Email duplication during portal account registration.
  - *Mitigation*: Validate uniqueness in `AspNetUsers` and match to a single active record in the `Propietarios` table.
