## 1. Base Setup & Configuration

- [x] 1.1 Make `Program` visible (`public partial class Program`) in `Program.cs`.
- [x] 1.2 Add `PetClinic.IntegrationTests` project to `PetClinic.slnx`.
- [x] 1.3 Create `.csproj` file with required dependencies (MSTest, Mvc.Testing, EFCore).
- [x] 1.4 Implement `CustomWebApplicationFactory.cs` (handling clean SQL test DB creation).
- [x] 1.5 Implement `IntegrationTestBase.cs` (handling HTTP client, auth token helpers, and transaction rollbacks).

## 2. Authentication Integration Tests

- [x] 2.1 Test login with correct password returns a valid JWT.
- [x] 2.2 Test login with incorrect password returns 401 Unauthorized.
- [x] 2.3 Test roles restriction (e.g. non-admin cannot create a veterinarian).

## 3. Veterinarios Integration Tests

- [x] 3.1 Test `GET /api/veterinarios` returns status 200 and listings.
- [x] 3.2 Test `POST /api/veterinarios` creates new vet in database.
- [x] 3.3 Test `PUT /api/veterinarios/{id}` updates vet fields in SQL Server.
- [x] 3.4 Test `DELETE /api/veterinarios/{id}` soft-deletes vet (logical delete check).

## 4. Propietarios Integration Tests

- [x] 4.1 Test `GET /api/propietarios` list.
- [x] 4.2 Test `POST /api/propietarios` creates new owner.
- [x] 4.3 Test `PUT /api/propietarios/{id}` updates owner details.
- [x] 4.4 Test `DELETE /api/propietarios/{id}` logical deletion.

## 5. Mascotas & Pesos Integration Tests

- [x] 5.1 Test `POST /api/mascotas` registers pet under owner (validates owner FK).
- [x] 5.2 Test `POST /api/mascotas/{id}/pesos` records pet weight and logs history.
- [x] 5.3 Test registering a pet for an inactive owner fails with validation error.

## 6. Citas & Consultas Integration Tests

- [x] 6.1 Test scheduling appointment (`POST /api/citas`).
- [x] 6.2 Test completing appointment and generating `DetalleConsulta` clinical history.

## 7. Hospitalizaciones & Telemetría Integration Tests

- [x] 7.1 Test hospitalize a pet (`POST /api/hospitalizaciones`).
- [x] 7.2 Test adding vital constant monitoring logs (`POST /api/hospitalizaciones/{id}/monitoreo`).
- [x] 7.3 Test adding and completing clinical tasks.
