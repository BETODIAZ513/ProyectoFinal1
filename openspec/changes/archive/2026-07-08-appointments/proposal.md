## Why

El sistema requiere organizar las consultas clínicas mediante el agendamiento y control de citas, regulando la disponibilidad horaria de los Veterinarios y ofreciendo vistas personalizadas para Recepción, Veterinarios y Auxiliares Clínicos (Módulo 4 de la ERS).

## What Changes

- **Backend (`PetClinic.Domain`, `PetClinic.Application`, `PetClinic.Infrastructure`, `PetClinic.Api`)**:
  - Definición de la entidad `Cita` vinculando `MascotaId`, `VeterinarioId` y administrando propiedades de fecha, hora, motivo y estado (Agendada, Completada, Cancelada).
  - Implementación de lógica de negocio para validar disponibilidad: un veterinario no puede tener citas superpuestas (cruces de horario) en la misma fecha y hora.
  - Implementación de casos de uso (Commands/Queries con MediatR) para el CRUD completo de citas, confirmación de llegadas (para cambiar estado o registrar arribo) e inicio de atención.
  - Exposición de endpoints REST correspondientes (`api/citas` y `api/citas/{id}/estado`).
- **Frontend (`PetClinic.Web`)**:
  - Implementación de la vista interactiva de Citas (`Appointments.tsx` para el Administrador).
  - Reemplazo de los placeholders para Recepción (Sala de Espera y arribos) y Consultas (Agenda diaria del Veterinario logueado).

## Capabilities

### New Capabilities
- `appointment-booking`: Gestión de citas con control de estados y validación de disponibilidad horaria por médico.

### Modified Capabilities
<!-- None -->

## Impact

Este cambio introduce la tabla `Citas` en base de datos. Completa las vistas operativas principales en el frontend React para Recepcionistas y Veterinarios, cerrando el flujo operativo de agendamiento y atención de pacientes.
