## 1. Database Migration & Schema Changes

- [ ] 1.1 Add `FirebaseUserId`, `CodigoVinculacion`, and `ExpiracionCodigo` properties to the `Propietario` domain entity.
- [ ] 1.2 Create and apply Entity Framework Core migrations to update the SQL Server database schema.

## 2. Backend API Endpoints

- [ ] 2.1 Configure `JwtBearer` token validation to support Firebase ID tokens on the API backend.
- [ ] 2.2 Implement the code generation command `/api/propietarios/{id}/generar-codigo` (restricted to receptionist/admin roles) storing the 150-second OTP.
- [ ] 2.3 Implement the `/api/portal/vincular` verification endpoint that links the client's Firebase UID and email.
- [ ] 2.4 Update the `PortalController` base actions to return `403 Forbidden` if the owner's account status is `Activo = false`.

## 3. Backoffice UI Changes

- [ ] 3.1 Add a "Generar Código de Acceso" button in the Backoffice Owners table layout.
- [ ] 3.2 Add a "Propietarios Pendientes" filter list and approval/verification button action.

## 4. Client Portal Mobile UI Changes

- [ ] 4.1 Install the Firebase SDK and initialize Google Sign-In on the client portal.
- [ ] 4.2 Add the 6-digit OTP code validation input screen after Firebase login if the account is unlinked.
- [ ] 4.3 Implement the "Cuenta en Proceso de Verificación" restricted view for unverified remote sign-ups.

## 5. Verification & Testing

- [ ] 5.1 Implement unit tests verifying OTP expiration calculations and code match bounds.
- [ ] 5.2 Implement integration tests validating Firebase authentication mock handshakes and CORS scopes.
