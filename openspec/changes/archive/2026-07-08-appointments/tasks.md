## 1. Modelado de Dominio y Persistencia

- [ ] 1.1 Crear la clase de entidad `Cita` en `PetClinic.Domain/Entities/Cita.cs`.
- [ ] 1.2 Agregar `DbSet<Cita> Citas { get; }` a `IPetClinicDbContext.cs` y `PetClinicDbContext.cs`.
- [ ] 1.3 Configurar relaciones (FK a Mascota y Veterinario) en `OnModelCreating` en `PetClinicDbContext`.

## 2. Casos de Uso (CQRS con MediatR y FluentValidation)

- [ ] 2.1 Crear Command para agendar cita `CreateAppointmentCommand` con lógica de validación de disponibilidad y no encabalgamiento de 30 minutos.
- [ ] 2.2 Crear Command para actualizar estado de cita `UpdateAppointmentStatusCommand` (para arribos y transiciones).
- [ ] 2.3 Crear Queries para citas (`GetAppointmentsPagedQuery`, `GetTodayAppointmentsQuery` para Recepción y `GetAppointmentsByVeterinarianQuery` para Veterinario).
- [ ] 2.4 Crear validadores FluentValidation para citas (denegar fechas pasadas).

## 3. Controladores de la API REST

- [ ] 3.1 Crear `CitasController` en `PetClinic.Api/Controllers/` expuesto bajo autorización y restringiendo operaciones por roles.

## 4. Frontend SPA Vistas de Citas y Dashboards de Roles

- [ ] 4.1 Crear la página `Appointments.tsx` en `src/PetClinic.Web/src/pages/` (Administrador: listado general y agendamiento).
- [ ] 4.2 Crear la página `Reception.tsx` en `src/PetClinic.Web/src/pages/` (Recepcionista: sala de espera y arribos).
- [ ] 4.3 Crear la página `Consultations.tsx` en `src/PetClinic.Web/src/pages/` (Veterinario: agenda personalizada y completar citas).
- [ ] 4.4 Reemplazar las referencias de `Placeholder` por los nuevos componentes reales en `App.tsx` del frontend.

## 5. Compilación, Validación y Documentación

- [ ] 5.1 Ejecutar `dotnet build` en la raíz para validar la compilación limpia.
- [ ] 5.2 Ejecutar `dotnet test` para verificar las pruebas de integridad.
- [ ] 5.3 Actualizar el documento de arquitectura global `architecture.md` con los detalles técnicos del Sprint 5.
