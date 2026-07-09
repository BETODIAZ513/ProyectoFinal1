## Context

El objetivo es integrar persistencia con Microsoft SQL Server dentro de Docker Compose sin interrumpir la facilidad de desarrollo nativo.

## Goals / Non-Goals

**Goals:**
- Añadir base de datos física SQL Server a la infraestructura Docker.
- Mapear el puerto `1433` local para permitir conexiones de herramientas de administración (SSMS, Azure Data Studio).
- Mantener persistentes los datos entre apagados y encendidos de contenedores.

**Non-Goals:**
- No eliminar el soporte para bases de datos `InMemory` cuando se ejecute de forma nativa sin configurar cadenas de conexión.

## Decisions

### 1. Puerto Local Mapeado
- **Decisión**: Mapear el puerto de SQL Server como `1433:1433`.
- **Razón**: Permite la conexión directa de SSMS o Azure Data Studio desde el sistema operativo host (Windows) sin configuraciones adicionales.

### 2. Volumen de Datos Persistente
- **Decisión**: Crear un volumen nominal `mssql_data` en Docker.
- **Razón**: Asegura que la eliminación física del contenedor de base de datos no elimine los datos clínicos del usuario.

## Risks / Trade-offs

- **[Riesgo] Contraseña expuesta**: Tener la contraseña del administrador `sa` en texto plano en el archivo compose.
  - *Mitigación*: Como es un entorno de desarrollo local, no representa peligro crítico. Para producción se debe sobreescribir usando variables de entorno secretas del proveedor de nube.
