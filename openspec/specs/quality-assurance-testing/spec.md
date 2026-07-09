# quality-assurance-testing Specification

## Purpose
TBD - created by archiving change unit-tests. Update Purpose after archive.
## Requirements
### Requirement: Validación de Casos Clínicos en Pruebas
Las pruebas unitarias SHALL validar los escenarios críticos de la lógica de negocio del sistema, incluyendo solapamientos, jaulas únicas y auditorías de seguridad.

#### Scenario: Verificar solapamiento de citas
- **WHEN** un test intenta agendar una cita que coincide en horario con otra para el mismo veterinario
- **THEN** la prueba debe asegurar que se lance una excepción de solapamiento

#### Scenario: Verificar jaula única
- **WHEN** un test ingresa una mascota en una jaula ocupada
- **THEN** la prueba debe asegurar que el validador rechace la transacción

#### Scenario: Verificar inyección de auditoría
- **WHEN** un test persiste una entidad del dominio
- **THEN** la prueba debe validar que se auto-rellenen las propiedades de sombra (CreatedBy, CreatedAt)

