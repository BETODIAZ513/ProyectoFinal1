## Why

To enhance the security and onboarding experience of the PetClinic system by integrating Firebase Google Authentication, implementing a secure 150-second OTP (One-Time Password) code linking mechanism for in-person clients, and enforcing a restricted "Pending Verification" status for remote sign-up clients.

## What Changes

- **NEW** Integration of Firebase SDK in the frontends (`PetClinic.Web` and `PetClinic.PortalWeb`) for Google Login.
- **NEW** Backend endpoints to generate and validate 150-second OTP link codes (`CodigoVinculacion`).
- **NEW** "Cuenta por verificar" (Account Pending Verification) user interface banner and restriction logic on the client portal.
- **NEW** Actions in the Backoffice `Propietarios` dashboard to generate codes and manually verify/activate remote sign-ups.

## Capabilities

### New Capabilities

### Modified Capabilities
- `user-authentication`: Integrate Firebase Authentication (Google login) and OTP validation (150s expiration) for account linking.
- `owner-management`: Add presential verification code generation (OTP) for owners in the backoffice.
- `client-portal`: Restrict access to clinical history, weight, and booking for unverified owners, showing a pending verification screen.

## Impact

- `PetClinic.Api`: Configure JwtBearer options to validate Firebase ID tokens and add endpoints for OTP generation/verification.
- `PetClinic.Application`: Add Commands/Queries for generating OTP codes and approving pending accounts.
- `PetClinic.Web` & `PetClinic.PortalWeb`: Integrate Firebase JS SDK, Google login UI, and OTP input forms.
- Database: Add `FirebaseUserId`, `CodigoVinculacion`, and `ExpiracionCodigo` columns to the `Propietario` model.
