## Context

Se requiere habilitar una vista unificada de Horarios/Agendas en el Backoffice para todos los roles. Los auxiliares clínicos y recepcionistas deben poder visualizar la agenda de cualquier veterinario, y los veterinarios deben poder auto-agendar citas si tienen disponibilidad horaria.

## Goals / Non-Goals

**Goals:**
- Permitir la visualización de agendas y turnos a todos los roles a través de un nuevo módulo "Horarios".
- Permitir al Veterinario añadir citas en su propio horario mediante un modal de agendamiento.
- Habilitar al Auxiliar Clínico para consultar su turno rotativo y ver el cronograma de cualquier médico.

**Non-Goals:**
- Crear tablas de turnos complejos o control de asistencia biométrica.

## Decisions

### 1. Extensión del Endpoint de Citas del Veterinario
- **Decisión**: Modificar `CitasController.cs` para permitir que el método `GetByLoggedInVeterinarian` (ruta `GET /api/citas/veterinario`) sea accesible por todos los roles y reciba un parámetro opcional `[FromQuery] int? veterinarioId = null`. Si se provee, se ejecuta una nueva query `GetAppointmentsByVetIdQuery`.
- **Razón**: Permite la reutilización directa en el frontend para que auxiliares, recepcionistas y administradores consulten agendas médicas sin exponer listados masivos.

### 2. Autorización de Agendamiento para el Veterinario
- **Decisión**: Modificar la directiva `[Authorize(Roles = "Administrador,Recepcionista")]` en el método `Create` de `CitasController.cs` para admitir también al rol `Veterinario`.
- **Razón**: Permite la invocación directa del comando `CreateAppointmentCommand` por parte del médico desde el frontend.

### 3. Componente Frontend Schedules.tsx
- **Decisión**: Crear una nueva página en el frontend que represente visualmente las horas hábiles de la clínica (por ejemplo, de 8:00 AM a 6:00 PM en intervalos de 30 o 60 minutos), permitiendo clickear en slots disponibles o usar un botón para agendar.

## Risks / Trade-offs

- **[Riesgo]**: Al permitir al Veterinario crear citas, se podría intentar crear citas para otros médicos.
  - **Mitigación**: En la UI del Veterinario, el campo de selección del médico estará bloqueado a su propio ID para que solo pueda agendar citas para sí mismo. El backend valida el solapamiento del médico seleccionado.
