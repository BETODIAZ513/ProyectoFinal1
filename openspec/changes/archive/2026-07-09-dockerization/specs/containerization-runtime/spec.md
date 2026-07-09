## ADDED Requirements

### Requirement: Despliegue Multi-Contenedor
El sistema SHALL iniciar el backend de ASP.NET Core y el cliente React SPA mediante un solo comando de orquestación.

#### Scenario: Iniciar servicios con docker-compose
- **WHEN** el operador ejecuta `docker-compose up`
- **THEN** el sistema debe levantar los contenedores de la API y del Frontend
- **AND** ambos servicios deben estar enlazados en la misma red virtual

### Requirement: Enrutamiento SPA en Nginx
El contenedor del frontend SHALL servir los archivos estáticos y redirigir las solicitudes a rutas secundarias a `index.html` para permitir el funcionamiento de React Router.

#### Scenario: Refrescar ruta secundaria de la aplicación
- **WHEN** un usuario accede a la URL `http://localhost:5173/hospitalizacion` en el contenedor de Nginx
- **THEN** Nginx debe responder con el archivo `index.html` delegando el enrutamiento al cliente
