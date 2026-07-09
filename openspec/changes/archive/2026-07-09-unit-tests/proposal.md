## Why

El sistema requiere robustecer su calidad mediante pruebas automatizadas que validen las reglas críticas de negocio (solapamientos horariales de citas, ocupación de jaulas de hospitalización, cierres transaccionales de visitas, exclusión de auditoría y validación de pesos corporales) previniendo regresiones de código.

## What Changes

- **Test Projects (`tests/PetClinic.Application.UnitTests`)**:
  - Implementación de clases de pruebas de unidad basadas en MSTest/NUnit/xUnit que validen los comandos MediatR.
  - Simulación del contexto de base de datos en memoria para los handlers.

## Capabilities

### New Capabilities
- `quality-assurance-testing`: Cobertura de pruebas unitarias automatizadas para los flujos clínicos esenciales.

### Modified Capabilities
<!-- None -->

## Impact

Este cambio agrega archivos de pruebas dentro del directorio `tests/` del proyecto. No afecta la lógica de negocio ni el código de producción en ejecución.
