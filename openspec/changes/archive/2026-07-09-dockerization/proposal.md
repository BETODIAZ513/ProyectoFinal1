## Why

El sistema requiere ser empaquetado y orquestado en contenedores aislados (Docker) para garantizar la consistencia en el despliegue local de desarrollo y facilitar su posterior portabilidad a entornos de producción sin dependencias físicas en el sistema operativo host.

## What Changes

- **Backend (`PetClinic.Api`)**:
  - Creación de un `Dockerfile` multi-etapa para construir y correr la API en .NET 10.
- **Frontend (`PetClinic.Web`)**:
  - Creación de un `Dockerfile` para empaquetar el cliente SPA con Nginx como servidor web ligero de producción.
- **Orquestación (`docker-compose.yml`)**:
  - Configuración del compose en la raíz del proyecto para enlazar ambos contenedores y exponer los puertos `5173` y `5210`.

## Capabilities

### New Capabilities
- `containerization-runtime`: Soporte de empaquetado multi-contenedor para la API .NET y el cliente React SPA.

### Modified Capabilities
<!-- None -->

## Impact

Este cambio introduce archivos de empaquetamiento Docker en la raíz y carpetas de proyectos. No altera código de lógica de negocio o UI existente.
