## 1. Modelado de Dominio y Persistencia

- [ ] 1.1 Crear la clase de entidad `DetalleConsulta` en `PetClinic.Domain/Entities/DetalleConsulta.cs`.
- [ ] 1.2 Agregar `DbSet<DetalleConsulta> DetallesConsultas { get; }` a `IPetClinicDbContext.cs` y `PetClinicDbContext.cs`.
- [ ] 1.3 Configurar relaciones en `OnModelCreating` en `PetClinicDbContext`.

## 2. Casos de Uso (CQRS con MediatR y FluentValidation)

- [ ] 2.1 Crear Command `CreateConsultationDetailCommand` para registrar diagnóstico/tratamiento y completar la cita transaccionalmente.
- [ ] 2.2 Crear Query `GetClinicalHistoryQuery` para recuperar los diagnósticos de una mascota en orden cronológico inverso.
- [ ] 2.3 Crear Query `GetAppointmentsHistoryQuery` para listar el historial general de citas (Completadas/Canceladas).
- [ ] 2.4 Crear validadores FluentValidation para el detalle de consulta (diagnóstico y tratamiento obligatorios).

## 3. Controladores de la API REST

- [ ] 3.1 Crear `ConsultasDetallesController` en `PetClinic.Api/Controllers/` exponiendo la creación de bitácoras y las búsquedas por expediente.

## 4. Frontend SPA Vistas de Historias Clínicas e Historial de Citas

- [ ] 4.1 Modificar `Consultations.tsx` en `src/PetClinic.Web/src/pages/` para capturar diagnóstico y tratamiento al cerrar consulta.
- [ ] 4.2 Crear la página `History.tsx` en `src/PetClinic.Web/src/pages/` (Historial Global de Citas).
- [ ] 4.3 Crear la página `ClinicalHistory.tsx` en `src/PetClinic.Web/src/pages/` (Ficha Clínica y buscador de pacientes).
- [ ] 4.4 Reemplazar las referencias de `Placeholder` por los nuevos componentes en `App.tsx` del frontend.

## 5. Compilación, Validación y Documentación

- [ ] 5.1 Ejecutar `dotnet build` en la raíz para validar la compilación limpia.
- [ ] 5.2 Ejecutar `dotnet test` para verificar las pruebas de integridad.
- [ ] 5.3 Actualizar el documento de arquitectura global `architecture.md` con los detalles técnicos del Sprint 6.
