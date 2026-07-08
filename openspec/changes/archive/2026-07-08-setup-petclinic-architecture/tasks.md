## 1. Limpieza e Inicialización de Proyectos de Backend

- [ ] 1.1 Limpiar los directorios de compilación y carpetas vacías anteriores (`src/PetClinic.Domain`, `src/PetClinic.Infrastructure`, `src/PetClinic.WebUI`).
- [ ] 1.2 Crear el archivo de solución `PetClinic.sln` en la raíz del proyecto.
- [ ] 1.3 Crear el proyecto `PetClinic.Domain` como una biblioteca de clases en `src/PetClinic.Domain`.
- [ ] 1.4 Crear el proyecto `PetClinic.Application` como una biblioteca de clases en `src/PetClinic.Application`.
- [ ] 1.5 Crear el proyecto `PetClinic.Infrastructure` como una biblioteca de clases en `src/PetClinic.Infrastructure`.
- [ ] 1.6 Crear el proyecto `PetClinic.Api` como una Web API ASP.NET Core en `src/PetClinic.Api`.
- [ ] 1.7 Crear el proyecto de pruebas unitarias `PetClinic.Application.UnitTests` en `tests/PetClinic.Application.UnitTests`.
- [ ] 1.8 Agregar todos los proyectos creados a la solución `PetClinic.sln`.

## 2. Referencias entre Proyectos y Dependencias NuGet

- [ ] 2.1 Agregar referencia de `PetClinic.Domain` en `PetClinic.Application`.
- [ ] 2.2 Agregar referencia de `PetClinic.Application` en `PetClinic.Infrastructure`.
- [ ] 2.3 Agregar referencias de `PetClinic.Application` y `PetClinic.Infrastructure` en `PetClinic.Api`.
- [ ] 2.4 Agregar referencia de `PetClinic.Application` en `PetClinic.Application.UnitTests`.
- [ ] 2.5 Instalar paquetes NuGet esenciales (`MediatR` y `FluentValidation.DependencyInjectionExtensions`) en `PetClinic.Application`.
- [ ] 2.6 Instalar paquetes de persistencia e Identity (`Microsoft.EntityFrameworkCore.SqlServer`, `Microsoft.EntityFrameworkCore.Tools` y `Microsoft.AspNetCore.Identity.EntityFrameworkCore`) en `PetClinic.Infrastructure`.
- [ ] 2.7 Instalar paquete de diseño de EF Core (`Microsoft.EntityFrameworkCore.Design`) en `PetClinic.Api`.

## 3. Configuración del Backend y CORS

- [ ] 3.1 Crear el archivo `DependencyInjection.cs` en `PetClinic.Application` con el método `AddApplicationServices`.
- [ ] 3.2 Crear el archivo `DependencyInjection.cs` en `PetClinic.Infrastructure` con el método `AddInfrastructureServices`.
- [ ] 3.3 Modificar `Program.cs` en `PetClinic.Api` para registrar los servicios de Application e Infrastructure.
- [ ] 3.4 Configurar la política de CORS en `Program.cs` de `PetClinic.Api` para permitir peticiones desde el origen del frontend (`http://localhost:5173`).
- [ ] 3.5 Eliminar archivos `Class1.cs` autogenerados en las bibliotecas de clases.

## 4. Inicialización del Frontend SPA

- [ ] 4.1 Crear e inicializar el proyecto frontend `PetClinic.Web` dentro de `src/` utilizando Vite con la plantilla React + TypeScript en modo no interactivo.
- [ ] 4.2 Ejecutar `npm install` en el directorio de `PetClinic.Web` para descargar las dependencias del frontend.

## 5. Compilación y Validación

- [ ] 5.1 Ejecutar `dotnet build` en la raíz para verificar la correcta compilación de todo el backend.
- [ ] 5.2 Ejecutar `dotnet test` para asegurar el correcto funcionamiento de la suite de pruebas.
