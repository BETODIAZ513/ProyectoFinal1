## 1. Pruebas Unitarias de Citas y Consultas

- [ ] 1.1 Crear pruebas unitarias para `CreateAppointmentCommandHandler` (validando solapamiento de agendas horarias).
- [ ] 1.2 Crear pruebas unitarias para `CreateConsultationDetailCommandHandler` (cierre atómico de citas e historiales).

## 2. Pruebas Unitarias de Hospitalización y Tareas

- [ ] 2.1 Crear pruebas unitarias para `AdmitPatientCommandHandler` (validando unicidad de jaula asignada).
- [ ] 2.2 Crear pruebas unitarias para `CreateClinicalTaskCommandHandler` (creación de tareas en estado inicial "Pendiente").

## 3. Pruebas de Auditoría y Validación de Modelos

- [ ] 3.1 Crear pruebas unitarias para el DbContext que verifiquen la inyección de shadow properties y la exclusión de auditoría en `TareaPredefinida` y `RegistroPeso`.
- [ ] 3.2 Crear pruebas para validación de peso positivo.

## 4. Verificación y Documentación

- [ ] 4.1 Ejecutar `dotnet test` y confirmar el éxito del 100% de la suite.
- [ ] 4.2 Actualizar el documento de arquitectura global `architecture.md` con los detalles técnicos del Sprint 10.
