## ADDED Requirements

### Requirement: Registro de Tareas Clínicas
El Veterinario y Administrador SHALL poder registrar una tarea clínica asignando un título, descripción, mascota asociada y de forma opcional vincular una cita.

#### Scenario: Registrar tarea clínica exitosamente
- **WHEN** el Veterinario crea una tarea "Control de Temperatura" para la mascota "Toby"
- **THEN** la tarea se registra con el estado inicial "Pendiente"

### Requirement: Tablero Kanban de Control
El Auxiliar Clínico y Administrador SHALL poder visualizar las tareas clínicas organizadas en columnas por estado: "Pendiente", "En Progreso" y "Completada".

#### Scenario: Visualizar tablero clínico
- **WHEN** el Auxiliar Clínico abre la bandeja de tareas médicas
- **THEN** el sistema debe renderizar las tarjetas de tareas en sus respectivas columnas de estado

### Requirement: Transiciones de Estado en Kanban
El Auxiliar Clínico SHALL poder transicionar el estado de las tareas clínicas en el tablero mediante botones de avance rápido.

#### Scenario: Transicionar tarea de Pendiente a En Progreso
- **WHEN** el Auxiliar Clínico inicia la atención de una tarea en estado "Pendiente"
- **THEN** el sistema debe actualizar su estado a "En Progreso"
