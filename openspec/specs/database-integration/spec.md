# database-integration Specification

## Purpose
TBD - created by archiving change database-integration. Update Purpose after archive.
## Requirements
### Requirement: Orquestación de Base de Datos
El sistema SHALL orquestar una base de datos relacional persistente de Microsoft SQL Server utilizando contenedores Docker.

#### Scenario: Arrancar sistema integrado
- **GIVEN** que el sistema arranca usando `docker-compose up`
- **WHEN** la API inicia su ejecución
- **THEN** la API debe esperar a que el contenedor de base de datos esté listo, conectarse a él y construir el esquema automáticamente si no existe

#### Scenario: Persistencia de datos clínicos
- **WHEN** se registran mascotas o citas y se apagan los contenedores con `docker-compose down`
- **THEN** al iniciar nuevamente el sistema, los registros clínicos guardados anteriormente deben persistir intactos

