## Why

Para alcanzar un alto porcentaje de cobertura de código en todas las capas (principalmente en `PetClinic.Application`), es indispensable implementar pruebas automáticas para los módulos de Propietarios, Ficha Clínica avanzada (Vacunas, Alergias, Medicamentos) y todas las consultas de lectura (Queries) del sistema, blindando la lógica del negocio.

## What Changes

- **Test Projects (`tests/PetClinic.Application.UnitTests`)**:
  - Creación de clases de prueba para los comandos y validadores del módulo de Propietarios (`PropietarioTests.cs`).
  - Creación de clases de prueba para el módulo de Ficha Clínica avanzada (`FichaClinicaTests.cs`).
  - Creación de clases de prueba para los manejadores de consultas de lectura (`QueriesTests.cs`).
- **Domain Test Projects (`tests/PetClinic.Domain.UnitTests`)**:
  - Creación de pruebas de unidad básicas para las reglas de validación en entidades del Dominio (`DomainTests.cs`).

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `quality-assurance-testing`: Expansión de cobertura de pruebas unitarias cubriendo Propietarios, Ficha Clínica, Queries y modelos del dominio.

## Impact

Este cambio agrega archivos de pruebas en la carpeta `tests/`. No modifica código de producción ni lógica funcional en ejecución.
