## 1. Modelado de Dominio y Persistencia

- [ ] 1.1 Crear la clase de entidad `Hospitalizacion` en `PetClinic.Domain/Entities/Hospitalizacion.cs`.
- [ ] 1.2 Crear la clase de entidad `MonitoreoClinico` en `PetClinic.Domain/Entities/MonitoreoClinico.cs`.
- [ ] 1.3 Agregar sets a `IPetClinicDbContext.cs` y `PetClinicDbContext.cs`.
- [ ] 1.4 Configurar llaves y relaciones en `OnModelCreating` en `PetClinicDbContext`.

## 2. Casos de Uso (CQRS con MediatR y FluentValidation)

- [ ] 2.1 Crear Command `AdmitPatientCommand` para ingresar un paciente a hospitalización.
- [ ] 2.2 Crear Command `DischargePatientCommand` para registrar el alta clínica del paciente.
- [ ] 2.3 Crear Command `CreateMonitoringRecordCommand` para registrar signos vitales del paciente hospitalizado.
- [ ] 2.4 Crear Queries `GetHospitalizedPatientsQuery` y `GetMonitoringHistoryQuery`.
- [ ] 2.5 Crear validadores FluentValidation correspondientes.

## 3. Controladores de la API REST

- [ ] 3.1 Crear `HospitalizacionesController` en `PetClinic.Api/Controllers/` exponiendo ingresos, altas y telemetría de monitoreo.

## 4. Frontend SPA Tablero de Hospitalización y Monitoreo

- [ ] 4.1 Crear la página `Hospitalization.tsx` en `src/PetClinic.Web/src/pages/` (Tablero de internados, registro de parámetros vitales, altas y panel de telemetría).
- [ ] 4.2 Reemplazar la referencia de `Placeholder` por el componente `Hospitalization` en `App.tsx` del frontend.

## 5. Compilación, Validación y Documentación

- [ ] 5.1 Ejecutar `dotnet build` en la raíz para validar la compilación limpia.
- [ ] 5.2 Ejecutar `dotnet test` para verificar las pruebas de integridad.
- [ ] 5.3 Actualizar el documento de arquitectura global `architecture.md` con los detalles técnicos del Sprint 8.
