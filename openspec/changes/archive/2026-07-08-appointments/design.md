## Context

La veterinaria requiere un agendador de consultas para organizar la atención de pacientes, regular la agenda de los doctores y coordinar la sala de espera. Las citas transicionan a lo largo de varios estados (Agendada, Completada, Cancelada) y se debe impedir que un veterinario tenga dos citas cruzadas en la misma franja horaria.

## Goals / Non-Goals

**Goals:**
- Definir la entidad `Cita` en `PetClinic.Domain` y mapearla en base de datos.
- Desarrollar las consultas y comandos MediatR para agendar, actualizar, cancelar o completar consultas médicas.
- Implementar la lógica de validación horaria: impedir el cruce de horarios para un mismo veterinario (se considerará un intervalo fijo de 30 minutos por cita).
- Reemplazar los componentes mock en React frontend para dotar de funcionalidad al panel de Citas, Recepción (sala de espera) y Consultas clínicas.

**Non-Goals:**
- Implementar recetas o diagnósticos escritos estructurados (eso corresponde al historial clínico en el Sprint 6).

## Decisions

### 1. Modelado de Cita y Estados
- **Decisión**: La clase `Cita` tendrá propiedades: `Id`, `MascotaId`, `VeterinarioId`, `FechaHora` (DateTime), `Motivo` (string) y `Estado` (string/enum con valores: `Agendada`, `Completada`, `Cancelada`).
- **Razón**: Permite un seguimiento preciso y limpio del estado de la cita en los flujos de recepción y consulta.

### 2. Algoritmo de Cruce de Horarios (Overlapping)
- **Decisión**: Asumir una duración de consulta médica estándar de **30 minutos**. Al agendar o reprogramar una cita, el Handler validará mediante EF Core que no existan otras citas activas (`Estado != "Cancelada"`) del mismo veterinario cuyos 30 minutos de duración se crucen con la hora propuesta.
- **Razón**: Satisface el requerimiento de negocio de evitar colisiones en la agenda de los médicos veterinarios.

### 3. Distribución de Dashboards en Frontend
- **Decisión**: Mapear tres páginas distintas conectadas con los endpoints del API:
  1. `/citas` (Admin): Listado general e interfaz para registrar citas vinculando mascotas y veterinarios.
  2. `/recepcion` (Recepcionista): Listado diario de citas ordenado por hora. Permite cancelar citas o confirmar el arribo físico de los pacientes (cambiar estado visual).
  3. `/consultas` (Veterinario): Listado de citas asignadas únicamente al Veterinario logueado. Permite dar inicio a la consulta clínica y completarla.

## Risks / Trade-offs

- **[Riesgo] Citas del pasado**: Permitir el agendamiento de citas en horas o días que ya transcurrieron.
  - *Mitigación*: Se agregará una regla FluentValidation para denegar la creación de citas cuya `FechaHora` sea anterior a la fecha y hora actual del servidor.
