## ADDED Requirements

### Requirement: Catálogo de Tareas Predefinidas
El sistema SHALL proveer un listado estático de tareas predefinidas comunes (ej. "Administrar Medicación", "Control de Temperatura", "Curación de Herida") para agilizar el registro clínico.

#### Scenario: Carga del catálogo
- **WHEN** un Veterinario crea una tarea clínica
- **THEN** el sistema debe listar los nombres de tareas predefinidas en el selector del formulario

### Requirement: Exclusión de Auditoría Pasiva
La tabla de base de datos de `TareasPredefinidas` SHALL ser excluida de la inyección de propiedades de sombra de auditoría automática (CreatedBy, CreatedAt, UpdatedAt) según la regla de seguridad del sistema.

#### Scenario: Insertar tarea predefinida en catálogo y revisar auditoría
- **WHEN** el sistema inicializa una tarea predefinida
- **THEN** el sistema no debe inyectar valores para propiedades de sombra de auditoría en ese registro
