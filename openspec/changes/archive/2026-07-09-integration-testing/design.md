## Context

Se implementa el diseño físico de las pruebas de integración utilizando una base de datos real SQL Server de prueba.

## Decisions

### 1. Base de datos física de pruebas dedicada
- **Decisión**: Usar la base de datos `PetClinicDb_IntegrationTests` en lugar de la base de datos de desarrollo/producción o InMemory.
- **Razón**: Permite validar restricciones de llaves foráneas reales del motor SQL Server que InMemory ignora por completo.

### 2. Aislamiento por Borrado y Sembrado Rápido
- **Decisión**: Limpiar los registros de las tablas en cada ciclo `TestCleanup` y asegurar la presencia de las semillas Identity mediante `SeedDataAsync` en `TestInitialize`.
- **Razón**: Asegura que las pruebas no sufran de colisiones de datos y que cada caso comience sobre un estado limpio y consistente.

### 3. Deactivación en Cascada de Identidades
- **Decisión**: Implementar `DeactivateUserAsync` en `IdentityService` y llamarlo en `DeleteVeterinarianCommandHandler`.
- **Razón**: Garantiza que al desactivar a un veterinario, su cuenta de inicio de sesión también sea desactivada de forma automática (seguridad física).
