## ADDED Requirements

### Requirement: Estructura de la Solución
La solución del sistema PetClinic SHALL estar estructurada utilizando el patrón de Arquitectura Limpia (Clean Architecture), conteniendo proyectos independientes en `src/` para backend (Domain, Application, Infrastructure, Api) y frontend (Web).

#### Scenario: Compilación exitosa de la solución inicial
- **WHEN** se ejecuta el comando `dotnet build` en el directorio raíz de la solución
- **THEN** todos los proyectos del backend y de pruebas deben compilar con éxito y sin advertencias de dependencias circulares

### Requirement: Regla de Dependencia del Backend
Las referencias entre proyectos de backend SHALL seguir la dirección unidireccional hacia Domain:
- `PetClinic.Domain` no contiene dependencias de otros proyectos.
- `PetClinic.Application` solo depende de `PetClinic.Domain`.
- `PetClinic.Infrastructure` depende de `PetClinic.Application` y `PetClinic.Domain`.
- `PetClinic.Api` depende de `PetClinic.Infrastructure` y `PetClinic.Application`.

#### Scenario: Aislamiento del Dominio y Aplicación
- **WHEN** se compilan `PetClinic.Domain` y `PetClinic.Application`
- **THEN** no deben depender de la base de datos física o detalles de persistencia en Infrastructure.

### Requirement: Desacoplamiento del Frontend SPA
La capa cliente `PetClinic.Web` SHALL ser un proyecto independiente basado en una aplicación de página única (SPA) con React y TypeScript, desacoplada de la ejecución directa del servidor backend.

#### Scenario: Inicialización exitosa de React y TypeScript con Vite
- **WHEN** se revisa el proyecto `src/PetClinic.Web`
- **THEN** debe contener archivos de configuración de Vite, package.json, y el directorio principal de componentes React con TypeScript.

### Requirement: Pruebas Unitarias de Aplicación
Se SHALL proporcionar un proyecto de pruebas unitarias `PetClinic.Application.UnitTests` en la carpeta `tests/` para verificar la lógica de los casos de uso.

#### Scenario: Ejecución exitosa de pruebas
- **WHEN** se ejecuta el comando `dotnet test`
- **THEN** todas las pruebas configuradas en la solución deben completarse exitosamente.
