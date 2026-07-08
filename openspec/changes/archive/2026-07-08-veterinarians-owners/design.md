## Context

El sistema PetClinic requiere dar de alta y administrar el personal médico (Veterinarios) y los clientes (Propietarios) para habilitar las funcionalidades clínicas posteriores. Estos datos deben persistirse en SQL Server / InMemory, implementando lógica de validaciones y coordinando con la capa de seguridad (Identity) para la creación automática de perfiles de usuario.

## Goals / Non-Goals

**Goals:**
- Definir las entidades `Propietario` y `Veterinario` en la capa de Domain.
- Mapear las entidades en el DbContext de Infrastructure y exponerlas mediante endpoints de API controlados por rol (Administrador).
- Implementar los casos de uso (Commands/Queries) en la capa de Application para listados paginados, búsquedas, altas, ediciones y bajas lógicas.
- Asegurar que al crear un `Veterinario`, se cree automáticamente una cuenta de `ApplicationUser` asociada con el rol de "Veterinario".
- Desarrollar la interfaz web (SPA) en React para gestionar listados, búsquedas, creación, edición e inspección detallada de Propietarios y Veterinarios.

**Non-Goals:**
- Crear la funcionalidad de añadir mascotas o citas (estas entidades y sus lógicas se abordarán en futuros sprints).

## Decisions

### 1. Claves Primarias y Relación con Identity
- **Decisión**: Usar claves primarias enteras autoincrementales (`int`) para las entidades de negocio `Propietario` y `Veterinario`, y una clave string `ApplicationUserId` en `Veterinario` como relación externa 1:1 con las tablas de ASP.NET Core Identity.
- **Razón**: Permite mantener un diseño sencillo y eficiente para las búsquedas y relaciones relacionales del dominio veterinario, a la vez que se acopla limpiamente con el sistema de cuentas de Identity.

### 2. Coordinación de Transacciones al Crear Veterinarios
- **Decisión**: La creación de la cuenta de usuario (`UserManager.CreateAsync`) y el perfil de veterinario se realizarán dentro del mismo flujo de ejecución del Handler de la aplicación (`CreateVeterinarianCommandHandler`). Se utilizará la cuenta de correo electrónico del veterinario como su nombre de usuario e email de inicio de sesión, asignándole la contraseña por defecto `Vet123!` (la cual podrá cambiar).
- **Razón**: Garantiza la inmutabilidad y la consistencia de que ningún perfil de veterinario exista sin su respectiva cuenta de login asociada (REQ-VET-01).
- **Alternativas consideradas**: Crear la cuenta de Identity por separado. Descartado porque violaría la regla del Módulo 8 de que la cuenta debe crearse "simultáneamente".

### 3. Baja Lógica en lugar de Eliminación Física
- **Decisión**: La operación "eliminar" para Propietarios y Veterinarios no ejecutará un `DELETE` físico en la base de datos, sino que establecerá el campo booleano `Activo = false` (Propietarios) o la propiedad de estado a un valor inactivo (Veterinarios).
- **Razón**: Mantiene la integridad referencial histórica del sistema (ej. citas históricas ligadas a dueños o doctores inactivos) de acuerdo a REQ-PRO-01.

### 4. Paginación y Búsqueda en el Servidor
- **Decisión**: Los listados de propietarios y veterinarios se paginarán del lado del servidor. Las peticiones REST incluirán parámetros `page`, `pageSize` y `searchTerm`.
- **Razón**: Evita la sobrecarga de ancho de banda y rendimiento en el frontend React cuando el volumen de clientes aumente a miles de registros (REQ-PRO-02).

## Risks / Trade-offs

- **[Riesgo] Falla en la creación de usuario Identity pero éxito en Veterinario (o viceversa)**: Puede generar inconsistencia si no se controla adecuadamente.
  - *Mitigación*: Se validará el éxito de la creación del usuario primero, si falla se aborta la transacción y se retorna un error descriptivo de validación. Si tiene éxito, se procede a crear la entidad `Veterinario`.
