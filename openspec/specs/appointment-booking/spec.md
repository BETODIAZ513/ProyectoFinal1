# appointment-booking Specification

## Purpose
TBD - created by archiving change appointments. Update Purpose after archive.
## Requirements
### Requirement: Registro de Citas
El Recepcionista y Administrador SHALL poder agendar nuevas citas seleccionando una mascota activa, un veterinario activo, la fecha y hora de la cita, y el motivo de consulta.

#### Scenario: Agendar cita exitosamente
- **WHEN** el Recepcionista crea una cita para la mascota "Toby" con el veterinario "Dr. Pérez" para mañana a las 10:00 AM
- **THEN** el sistema registra la cita con el estado inicial de "Agendada"

### Requirement: Cruce de Horarios
El sistema SHALL denegar el agendamiento o reprogramación de una cita si el veterinario seleccionado ya posee otra cita (en estado no cancelado) dentro del mismo rango horario (duración estimada de 30 minutos).

#### Scenario: Intento de agendamiento con cruce de hora
- **WHEN** se intenta crear una cita a las 10:15 AM con un veterinario que ya tiene una cita agendada de 10:00 AM a 10:30 AM
- **THEN** el sistema debe denegar el registro y retornar una alerta indicando conflicto en la agenda del veterinario

### Requirement: Transiciones de Estado
Las citas SHALL transicionar entre los estados "Agendada", "Completada" y "Cancelada". Las citas canceladas o completadas no pueden volver al estado agendado.

#### Scenario: Cancelación de cita por el Recepcionista
- **WHEN** el Recepcionista cancela una cita agendada
- **THEN** el estado de la cita se actualiza a "Cancelada" y su espacio de tiempo queda liberado

### Requirement: Calendario por Rol
El sistema SHALL restringir el acceso a los listados de citas según el rol de sesión:
- El Veterinario solo SHALL visualizar las citas que le fueron asignadas.
- El Recepcionista SHALL visualizar y modificar el listado general del día (control de sala de espera).

#### Scenario: Acceso de Veterinario a sus citas
- **WHEN** un Veterinario logueado entra a su bandeja de consultas
- **THEN** el sistema debe listar únicamente las citas en las que dicho veterinario está asignado

