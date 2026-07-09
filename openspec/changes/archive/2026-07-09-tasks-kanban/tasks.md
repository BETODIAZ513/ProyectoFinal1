## 1. Modelado de Dominio y Persistencia

- [ ] 1.1 Crear la clase de entidad `TareaPredefinida` en `PetClinic.Domain/Entities/TareaPredefinida.cs`.
- [ ] 1.2 Crear la clase de entidad `TareaClinica` en `PetClinic.Domain/Entities/TareaClinica.cs`.
- [ ] 1.3 Agregar sets a `IPetClinicDbContext.cs` y `PetClinicDbContext.cs`.
- [ ] 1.4 Configurar llaves y relaciones en `OnModelCreating` en `PetClinicDbContext`.

## 2. Casos de Uso (CQRS con MediatR y FluentValidation)

- [ ] 2.1 Crear Command `CreateClinicalTaskCommand` para registrar una nueva tarea clínica en estado "Pendiente".
- [ ] 2.2 Crear Command `UpdateClinicalTaskStatusCommand` para transicionar el estado de la tarea (Pendiente, En Progreso, Completada).
- [ ] 2.3 Crear Queries `GetClinicalTasksQuery` (para alimentar el Kanban) y `GetPredefinedTasksQuery` (para el listado catálogo).
- [ ] 2.4 Crear validadores FluentValidation.

## 3. Controladores de la API REST

- [ ] 3.1 Crear `TareasController` en `PetClinic.Api/Controllers/` exponiendo endpoints del Kanban y catálogo.

## 4. Frontend SPA Tablero Kanban

- [ ] 4.1 Crear la página `MedicalTasks.tsx` en `src/PetClinic.Web/src/pages/` (Tablero Kanban de Tareas Clínicas y modal de creación integrado con selector de predefinidas).
- [ ] 4.2 Reemplazar la referencia de `Placeholder` por el componente `MedicalTasks` en `App.tsx` del frontend.

## 5. Compilación, Validación y Documentación

- [ ] 5.1 Ejecutar `dotnet build` en la raíz para validar la compilación limpia.
- [ ] 5.2 Ejecutar `dotnet test` para verificar las pruebas de integridad.
- [ ] 5.3 Actualizar el documento de arquitectura global `architecture.md` con los detalles técnicos del Sprint 7.
