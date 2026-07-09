## Context

Currently, the client portal uses custom email/password authentication mapped directly to ASP.NET Core Identity. To support a more modern and secure onboarding flow, we need to introduce:
- **Firebase Google Authentication** for the portal.
- **OTP (One-Time Password) Link Codes** of 6 digits with a tight 150-second (2.5 minutes) expiration to link in-person clients to their pre-existing profiles.
- **Pending Verification Banner & Restrictions** on the portal for remote sign-up users, allowing staff to verify their data prior to activation.

## Goals / Non-Goals

**Goals:**
- Enable Firebase Google Login on the React client portal.
- Enable generating 6-digit link codes in the backoffice.
- Enforce a 150-second expiration window on link codes.
- Restrict remote sign-up accounts (where `Propietario.Activo = false`) from accessing medical records, history, or scheduling.

**Non-Goals:**
- Porting the entire backoffice admin login to Firebase (admin/staff will keep using username/password identity authentication for this scope).

## Decisions

### 1. Database Model Additions
We will extend the `Propietario` model with the following fields:
- `FirebaseUserId` (string, nullable): To store the authenticated Google account ID.
- `CodigoVinculacion` (string, nullable): The generated 6-digit OTP code.
- `ExpiracionCodigo` (DateTime, nullable): The UTC timestamp when the code expires (150 seconds from generation).

### 2. OTP Verification Logic
- **Generation Endpoint**: `POST /api/propietarios/{id}/generar-codigo` (Restricted to `Administrador`/`Recepcionista`). Generates a 6-digit random number, sets `ExpiracionCodigo = DateTime.UtcNow.AddSeconds(150)`, and saves it.
- **Verification Endpoint**: `POST /api/portal/vincular` (Restricted to authenticated portal user). Compares the entered code, checks if `DateTime.UtcNow <= ExpiracionCodigo`, associates the client's `FirebaseUserId` with the `Propietario` record, sets `Activo = true`, and returns success.

### 3. Remote Sign-up Account Scoping
- If a user registers remotely, a new `Propietario` record is inserted with `Activo = false`.
- The `PortalController` endpoints will return an HTTP 403 Forbidden or empty data if `Activo = false`.
- The portal UI will check the status and render a prominent "Cuenta pendiente de verificación" dashboard screen.

## Risks / Trade-offs

- **[Risk] OTP Timing Skew**: If the client's phone time or backend server time differs, 150 seconds might expire too quickly.
  - *Mitigation*: We will use UTC timestamp comparison on the database server exclusively.
