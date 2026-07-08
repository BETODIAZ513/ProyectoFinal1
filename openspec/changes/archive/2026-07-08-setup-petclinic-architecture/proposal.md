## Why

Inicializar el esqueleto del sistema PetClinic Management System bajo el diseño de Arquitectura Limpia (Clean Architecture) con .NET 10 para la parte del backend (Web API) y una aplicación frontend desacoplada basada en un cliente SPA, facilitando el desarrollo modular, el testeo y la escalabilidad del sistema.

## What Changes

- Creación del archivo de solución .NET (`PetClinic.sln`) en el directorio raíz.
- Creación y configuración de la estructura de proyectos de backend en la carpeta `src/`:
  - **`PetClinic.Domain`**: Capa de dominio que contiene entidades puras, enums y reglas de negocio sin dependencias externas.
  - **`PetClinic.Application`**: Capa de aplicación con casos de uso (CQRS/MediatR), validadores, DTOs e interfaces. Depende únicamente de `PetClinic.Domain`.
  - **`PetClinic.Infrastructure`**: Capa de persistencia e implementaciones de infraestructura (Entity Framework Core 10, repositorios y SQL Server). Depende de `PetClinic.Application` y `PetClinic.Domain`.
  - **`PetClinic.Api`**: Proyecto Web API ASP.NET Core (.NET 10) que expone controladores HTTP y sirve como punto de entrada de la API.
- Creación y configuración del proyecto frontend en `src/`:
  - **`PetClinic.Web`**: Proyecto cliente web para la Single Page Application (SPA).
- Creación de la estructura del proyecto de pruebas en la carpeta `tests/`:
  - **`PetClinic.Application.UnitTests`**: Proyecto de pruebas unitarias para validar la lógica de la aplicación y sus casos de uso.
- Configuración de las dependencias NuGet principales en los archivos de proyecto correspondientes.
- Establecimiento de las referencias correctas de acuerdo al diseño de Arquitectura Limpia.

## Capabilities

### New Capabilities
- `bootstrap-petclinic-architecture`: Inicializar la solución del sistema PetClinic estructurada bajo el patrón de Arquitectura Limpia con backend Web API (.NET 10), cliente frontend SPA y suite de pruebas unitarias.

### Modified Capabilities
<!-- None -->

## Impact

Este cambio establece el esqueleto base para el backend y frontend del sistema. Afecta la raíz y la carpeta `src/` al crear los proyectos, solución y configuraciones de arranque. No introduce lógica de negocio real, pero define los límites estructurales de código.
