# integration-testing Specification

## Purpose
TBD - created by archiving change integration-testing. Update Purpose after archive.
## Requirements
### Requirement: Pruebas de Integración y Seguridad del API
El sistema SHALL ejecutar un pipeline completo de pruebas de integración que valide la persistencia física, seguridad de accesos y ciclo de vida del negocio clínico.

#### Scenario: Deactivación en cascada de accesos de personal
- **GIVEN** que el Administrador elimina lógicamente a un Veterinario activo
- **WHEN** se procesa la solicitud en la base de datos
- **THEN** el sistema debe actualizar la tabla de veterinarios y desactivar la cuenta de usuario correspondiente en la base de datos de Identity de forma automática

