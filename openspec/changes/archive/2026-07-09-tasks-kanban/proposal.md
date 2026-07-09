## Why

El sistema requiere organizar las tareas clínicas delegadas al personal auxiliar (Módulo 5 de la ERS) utilizando un tablero Kanban para coordinar la atención del paciente y permitir la carga de catálogos predefinidos sin auditoría pasiva (REQ-SEG-03).

## What Changes

- **Backend (`PetClinic.Domain`, `PetClinic.Application`, `PetClinic.Infrastructure`, `PetClinic.Api`)**:
  - Definición de las entidades `TareaPredefinida` (excluida de shadow properties de auditoría) y `TareaClinica`.
  - Implementación de casos de uso (CQRS con MediatR) para el CRUD de tareas clínicas y consulta del catálogo.
  - Exposición de endpoints REST correspondientes (`api/tareas-clinicas` y `api/tareas-predefinidas`).
- **Frontend (`PetClinic.Web`)**:
  - Creación del tablero Kanban interactivo (`MedicalTasks.tsx`) para la gestión visual del personal auxiliar (Pendiente, En Progreso, Completada).
  - Integración del enrutamiento real en `App.tsx` reemplazando los placeholders para `/tareas-medicas`.

## Capabilities

### New Capabilities
- `predefined-tasks`: Catálogo de tareas estáticas preconfiguradas para guiar el flujo auxiliar clínico.
- `clinical-tasks`: Flujo Kanban de tareas operativas y transiciones de estados (Pendiente, En Progreso, Completada).

### Modified Capabilities
<!-- None -->

## Impact

Este cambio introduce las tablas `TareasPredefinidas` y `TareasClinicas` en base de datos. Habilita al personal clínico (Veterinarios y Auxiliares) a coordinar cuidados intrahospitalarios de manera ágil.
