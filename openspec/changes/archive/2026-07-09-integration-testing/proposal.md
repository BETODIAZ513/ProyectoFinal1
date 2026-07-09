## Why

Para garantizar la estabilidad del backend y asegurar que las integraciones entre la API, los comandos/consultas (MediatR), los validadores (FluentValidation) y la base de datos física SQL Server de Docker funcionen correctamente bajo transacciones y restricciones reales de llaves foráneas.

## What Changes

- **Test Infrastructure**:
  - Crear el proyecto `tests/PetClinic.IntegrationTests` apuntando a .NET 10.0.
  - Implementar la factoría web de pruebas (`CustomWebApplicationFactory.cs`) y la clase base de aislamiento (`IntegrationTestBase.cs`).
  - Configurar base de datos física temporal `PetClinicDb_IntegrationTests` para pruebas.
- **Deactivation Hook**:
  - Implementar deactivación de cuentas Identity al dar de baja lógica a veterinarios.
- **Test Coverage**:
  - Crear 28 pruebas de integración abarcando Auth, Veterinarios, Propietarios, Mascotas, Pesos, Citas, Hospitalizaciones, Monitoreos y Tareas Clínicas.

## Capabilities

### New Capabilities
- `integration-testing-pipeline`: Provee una base sólida de pruebas contra base de datos real.

## Impact

Se alcanza una cobertura de código robusta. El proyecto cuenta ahora con 55 pruebas totales (27 unitarias y 28 de integración) que validan el comportamiento funcional y de seguridad de extremo a extremo de forma local y automatizada.
