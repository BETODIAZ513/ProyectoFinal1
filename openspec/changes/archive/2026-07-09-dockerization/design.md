## Context

Se requiere empaquetar el backend en .NET 10 y el frontend React en contenedores Docker de manera eficiente utilizando compilaciones multi-etapa (multi-stage builds) y un servidor web Nginx para servir los archivos estáticos de la SPA React.

## Goals / Non-Goals

**Goals:**
- Crear el `Dockerfile` de .NET 10 para `PetClinic.Api` optimizado en tamaño.
- Crear el `Dockerfile` de Node/Nginx para `PetClinic.Web` que soporte rutas dinámicas de React Router (fallbacks).
- Crear el archivo `docker-compose.yml` que orqueste ambos servicios.
- Proporcionar las variables de entorno necesarias para la comunicación entre servicios.

**Non-Goals:**
- Configuración de pipelines CI/CD automatizados en GitHub Actions para este Sprint.

## Decisions

### 1. Dockerfile Multi-Etapa para .NET 10
- **Decisión**: Utilizar la imagen base `mcr.microsoft.com/dotnet/sdk:10.0` para compilar y la imagen ligera `mcr.microsoft.com/dotnet/aspnet:10.0` para ejecución.
- **Razón**: Reduce drásticamente el tamaño final de la imagen al no incluir el SDK de compilación en el contenedor de ejecución.

### 2. Servidor Nginx para React SPA
- **Decisión**: El frontend de React se compilará con `node:20-alpine` y los archivos estáticos resultantes serán servidos mediante `nginx:alpine` con una configuración que redirija todas las peticiones no encontradas a `index.html`.
- **Razón**: Nginx es extremadamente ligero y eficiente sirviendo estáticos, y el fallback a `index.html` es indispensable para que las rutas dinámicas de React Router (ej. `/citas`) no den error 404 al refrescar la pantalla.

### 3. Mapeo de Puertos en Compose
- **Decisión**: Mapear el puerto `5173` para el frontend y `5210` para el backend.
- **Razón**: Mantiene total compatibilidad con la configuración de desarrollo local sin requerir cambios de puertos en el código del frontend.

## Risks / Trade-offs

- **[Riesgo] Error CORS al conectar contenedores**: Que el frontend no logre llamar al backend por resolución de DNS o bloqueos de origen.
  - *Mitigación*: Se configurará Nginx o las variables de entorno de React para apuntar a la URL externa `http://localhost:5210` en el navegador del cliente.
