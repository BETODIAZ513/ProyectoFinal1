## Why

Actualmente, el sistema utiliza bases de datos volátiles `InMemory` para pruebas locales. Para lograr persistencia real y simular un entorno de producción local estable, se requiere integrar una base de datos Microsoft SQL Server física e interactiva dentro de los contenedores Docker de desarrollo.

## What Changes

- **Docker Compose (`docker-compose.yml`)**:
  - Agregar el servicio `petclinic-db` usando la imagen oficial `mcr.microsoft.com/mssql/server:2022-latest`.
  - Exponer el puerto `1433` localmente y configurar la contraseña de administración `sa`.
  - Crear un volumen persistente `mssql_data` para guardar los datos clínicos en el disco físico del desarrollador.
- **Backend Service Configuration (`docker-compose.yml`)**:
  - Pasar la cadena de conexión real en las variables de entorno de la API: `ConnectionStrings__DefaultConnection`.
  - Añadir la dependencia `depends_on` para asegurar que el contenedor de base de datos arranque antes de la API.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `quality-assurance-testing`: No altera las pruebas unitarias InMemory, pero habilita las pruebas contra bases de datos reales.

## Impact

Este cambio proveerá persistencia completa de datos. Toda mascota, propietario o cita registrada persistirá entre reinicios de los contenedores Docker. Además, permitirá conectar herramientas de administración como SQL Server Management Studio (SSMS) a `localhost,1433` usando credenciales seguras.
