## Why

El sistema requiere registrar los diagnósticos y tratamientos durante las consultas (Módulo 3 de la ERS) para conformar el expediente clínico del paciente y permitir la auditoría histórica de atenciones pasadas.

## What Changes

- **Backend (`PetClinic.Domain`, `PetClinic.Application`, `PetClinic.Infrastructure`, `PetClinic.Api`)**:
  - Definición de la entidad `DetalleConsulta` para almacenar el diagnóstico, tratamiento y notas adicionales vinculando una cita, mascota y veterinario.
  - Implementación de casos de uso (Commands/Queries con MediatR) para registrar un detalle de consulta y consultar el historial médico agrupado por paciente.
  - Exposición de endpoints REST correspondientes (`api/consultas-detalles` y `api/mascotas/{id}/historial-clinico`).
- **Frontend (`PetClinic.Web`)**:
  - Actualización de la pantalla `/consultas` del Veterinario para solicitar diagnóstico y tratamiento al finalizar una cita, registrando el detalle clínico automáticamente.
  - Reemplazo de los placeholders para `/historial` (Historial Global de Citas) y `/historial-clinico` (Buscador y Visualizador del Expediente Clínico Completo).

## Capabilities

### New Capabilities
- `clinical-history`: Creación y consulta de expedientes clínicos con diagnósticos y tratamientos detallados.
- `appointments-archive`: Historial general de citas operadas y archivadas para auditoría.

### Modified Capabilities
<!-- None -->

## Impact

Este cambio introduce la tabla `DetallesConsultas` en base de datos. Completa las vistas finales del frontend React para el ciclo operativo clínico veterinario, facilitando la consulta de la evolución de salud de cada mascota.
