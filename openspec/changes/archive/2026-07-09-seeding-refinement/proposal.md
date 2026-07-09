## Why

Tras la inicialización de la base de datos física SQL Server en Docker, surgieron problemas de políticas de seguridad en la contraseña (`sa`) y se identificó la necesidad de poblar la base de datos con un conjunto de datos ficticios a gran escala para facilitar las pruebas manuales de todos los roles clínicos.

## What Changes

- **Identity Seeding**:
  - Incrementar el sembrado de usuarios para contar con 2 administradores, 4 veterinarios, 3 auxiliares y 2 recepcionistas.
  - Asegurar la creación del rol correspondiente para cada cuenta.
- **Domain Seeding**:
  - Crear 4 perfiles clínicos en la tabla `Veterinarios` enlazados a sus respectivas cuentas de identidad.
  - Sembrar 10 propietarios reales con datos peruanos simulados.
  - Sembrar 15 mascotas vinculadas a dichos propietarios, con sus respectivos históricos de peso.
  - Sembrar 10 citas médicas (4 pasadas, 3 para hoy, 3 futuras) asociadas a veterinarios y mascotas.
  - Sembrar detalles de consultas médicas para las citas pasadas.
  - Sembrar 4 hospitalizaciones (2 activas en jaulas y 2 de alta) con sus respectivos monitoreos constantes y tareas de enfermería.
- **Docker database settings**:
  - Cambiar clave del administrador `sa` a `ClinicaMascotas2026#` para cumplir la política de complejidad de contraseñas.
  - Renombrar el contenedor de base de datos a `petclinic-db-server` para alinearse a la nomenclatura del proyecto.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `quality-assurance-testing`: Expande la suite de semillas para pruebas locales y simulaciones.

## Impact

Este cambio provee un entorno local listo para usar, lleno de información de prueba realista para todos los roles (administradores, médicos, auxiliares y recepcionistas). Además, garantiza que SSMS pueda conectarse de forma nativa a la base de datos sin errores de políticas de claves.
