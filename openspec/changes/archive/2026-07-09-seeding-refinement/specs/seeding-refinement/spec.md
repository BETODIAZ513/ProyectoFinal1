## ADDED Requirements

### Requirement: Inicialización y Escalado de Semillas
El sistema SHALL inicializar automáticamente un conjunto de datos ficticios escalados para todos los perfiles y roles del sistema al detectar una base de datos vacía.

#### Scenario: Autogeneración de perfiles clínicos
- **GIVEN** que el sistema arranca con una base de datos vacía
- **WHEN** se crean las cuentas de identidad para los veterinarios
- **THEN** el sistema debe autogenerar un perfil clínico correspondiente en la tabla `Veterinarios` enlazado a su cuenta

#### Scenario: Sembrado coherente de citas y hospitalizaciones
- **WHEN** la API inicia su ejecución por primera vez
- **THEN** el sistema debe sembrar 10 propietarios, 15 mascotas con pesos, 10 citas y hospitalizaciones activas con monitoreos y tareas de enfermería
