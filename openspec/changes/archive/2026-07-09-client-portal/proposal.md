## Why

To extend the PetClinic system by adding a dedicated, mobile-first Client Portal (`PetClinic.PortalWeb`) for pet owners (clients). This allows owners to securely view clinical records, weight tracking, and active hospitalization status for their pets, using a modern interface with day/night mode support, while laying the layout groundwork (menus) for future features like online booking and a store.

## What Changes

- **NEW** `PetClinic.PortalWeb` mobile-first React/Vite web application supporting responsive viewports and a dark/light mode toggle.
- **NEW** Navigation menu in the portal containing links to: Dashboard (Pets list), Book Appointment (Placeholder), and Store (Placeholder).
- **NEW** API endpoints under `/api/portal/` inside `PetClinic.Api` designed specifically for clients to read their own pets' records (profiles, weight history, and active hospitalization statuses).
- **MODIFIED** Database seeding to generate standard Client portal users linked to existing `Propietario` records for local testing.

## Capabilities

### New Capabilities
- `client-portal`: Mobile-friendly portal web app and dedicated API endpoints for pet owners to view their pets, medical history, weight charts, and toggling dark/light mode.

### Modified Capabilities
- `user-authentication`: Expand the authentication system to support client roles and link portal accounts to `Propietario` profiles.

## Impact

- `PetClinic.Api`: New controllers and route prefix `/api/portal/` for client portal actions.
- `PetClinic.Application`: Client-specific queries (pets, histories, weights, hospitalizations).
- `docker-compose.yml`: Register the new `petclinic-portal-web` service.
- Infrastructure: Enforce JWT authentication claims matching user IDs to `PropietarioId`.
