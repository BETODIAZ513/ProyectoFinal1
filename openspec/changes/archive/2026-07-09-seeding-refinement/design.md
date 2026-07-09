## Context

Se requiere documentar los ajustes realizados tras corregir la inicialización de la base de datos SQL Server y el incremento de semillas de datos.

## Goals / Non-Goals

**Goals:**
- Ajustar contraseña del administrador de base de datos a `ClinicaMascotas2026#` para cumplir con las políticas de complejidad de SQL Server.
- Renombrar el contenedor de base de datos a `petclinic-db-server`.
- Respaldar el estado original del esquema mediante un archivo `.bak` guardado en la raíz del proyecto.
- Poblar la base de datos con un conjunto de datos sembrados coherentes de forma automática.

## Decisions

### 1. Cambio de Clave
- **Decisión**: Reemplazar `YourStrong@Password123!` por `ClinicaMascotas2026#`.
- **Razón**: El motor de SQL Server 2022 rechaza claves que contienen la palabra común "Password", deshabilitando la cuenta `sa`.

### 2. Copia de Seguridad local (`.bak`)
- **Decisión**: Ejecutar `BACKUP DATABASE` en el contenedor y copiar el archivo `.bak` a la raíz del proyecto.
- **Razón**: Permite restaurar el esquema original de forma rápida sin necesidad de recompilar el proyecto.

## Risks / Trade-offs

- **[Trade-off] Tamaño del Sembrado**: Tener una semilla tan grande incrementa levemente el tiempo del primer arranque de la API.
  - *Mitigación*: Se condiciona a que la base de datos esté vacía antes de insertar (`!context.Propietarios.Any()`), previniendo lentitud en reinicios subsiguientes.
