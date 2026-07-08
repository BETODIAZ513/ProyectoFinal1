## Context

El proyecto actual no cuenta con código inicial. Se requiere estructurar una solución .NET 10 bajo el patrón de Clean Architecture (Arquitectura Limpia) para dar cabida a los desarrollos futuros del sistema PetClinic Management System, cumpliendo con los requisitos de negocio descritos en la ERS.

## Goals / Non-Goals

**Goals:**
- Crear la solución principal `PetClinic.sln`.
- Crear los proyectos del core del sistema (`src/`): Domain, Application, Infrastructure, WebUI.
- Establecer las referencias correctas entre proyectos para garantizar el flujo unidireccional de dependencias (Domain <- Application <- Infrastructure <- WebUI).
- Configurar proyectos de pruebas en la carpeta `tests/` para pruebas unitarias y de integración.
- Instalar dependencias NuGet de infraestructura clave (como EF Core para SQL Server y MediatR).
- Garantizar que la solución compile limpiamente desde su inicialización.

**Non-Goals:**
- Implementar casos de uso reales de negocio (CRUDs de mascotas, citas, etc.).
- Diseñar la base de datos real o crear migraciones de Entity Framework.
- Desarrollar las vistas (HTML/CSS) o controladores funcionales para las pantallas de inicio de sesión o dashboards.

## Decisions

### 1. Estructura de Proyectos Separados (.csproj)
- **Decisión**: Se usarán proyectos separados físicamente para cada capa (`PetClinic.Domain`, `PetClinic.Application`, `PetClinic.Infrastructure`, `PetClinic.WebUI`) en lugar de usar namespaces dentro de un único proyecto.
- **Razón**: Permite hacer cumplir estrictamente los límites arquitectónicos en tiempo de compilación. Por ejemplo, `PetClinic.Domain` no puede compilar si se le agrega accidentalmente una referencia a `PetClinic.Infrastructure`.
- **Alternativas consideradas**: Solución mono-proyecto con subcarpetas. Descartado porque no previene el acoplamiento directo entre capas por descuidos del desarrollador.

### 2. Organización de la Inyección de Dependencias
- **Decisión**: Cada capa (`Application` e `Infrastructure`) expondrá un método de extensión estático (e.g., `AddApplicationServices` y `AddInfrastructureServices`) en una clase `DependencyInjection.cs`.
- **Razón**: Mantiene el archivo `Program.cs` del proyecto `WebUI` ordenado y modularizado. Cada proyecto es responsable de declarar y configurar sus propias dependencias.
- **Alternativas consideradas**: Registrar todo directamente en `Program.cs` del proyecto Web. Descartado por violar el principio de responsabilidad única del punto de entrada y crecer desmedidamente a medida que el sistema escala.

### 3. Frameworks de Pruebas
- **Decisión**: Configurar proyectos MSTest para pruebas unitarias de Domain y Application, y pruebas de integración para la persistencia en Infrastructure.
- **Razón**: Mantener la consistencia con lo definido en la especificación formal del proyecto.
- **Alternativas consideradas**: xUnit o NUnit. Descartados para alinearse perfectamente al stack especificado en la ERS.

## Risks / Trade-offs

- **[Riesgo] Complejidad inicial en la gestión de referencias**: Al tener múltiples proyectos, el mantenimiento de paquetes NuGet y configuraciones comunes es más complejo que en un proyecto MVC tradicional.
  - *Mitigación*: Se configurará un archivo de solución consolidado y una estructura clara de dependencias iniciales bien documentadas.
