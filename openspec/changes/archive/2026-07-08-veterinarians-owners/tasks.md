## 1. Modelado de Dominio y Mapeo en Persistencia

- [ ] 1.1 Crear la clase de entidad `Propietario` en `PetClinic.Domain/Entities/`.
- [ ] 1.2 Crear la clase de entidad `Veterinario` en `PetClinic.Domain/Entities/`.
- [ ] 1.3 Agregar `DbSet<Propietario>` y `DbSet<Veterinario>` a `PetClinicDbContext` en `PetClinic.Infrastructure/Persistence/`.
- [ ] 1.4 Configurar relaciones e índices únicos en `OnModelCreating` en `PetClinicDbContext` (ej. índice único para correo).

## 2. Casos de Uso (CQRS con MediatR y FluentValidation) en Application

- [ ] 2.1 Crear Commands para `Propietario` (`CreateOwnerCommand`, `UpdateOwnerCommand`, `DeleteOwnerCommand` para baja lógica).
- [ ] 2.2 Crear Queries para `Propietario` (`GetOwnerByIdQuery`, `GetOwnersPagedQuery` con paginación y filtros de búsqueda).
- [ ] 2.3 Crear validadores FluentValidation para la creación y edición de Propietarios.
- [ ] 2.4 Crear Commands para `Veterinario` (`CreateVeterinarianCommand` con sincronización en Identity, `UpdateVeterinarianCommand`, `DeleteVeterinarianCommand`).
- [ ] 2.5 Crear Queries para `Veterinario` (`GetVeterinariansQuery` para el listado general).
- [ ] 2.6 Crear validadores FluentValidation para la creación y edición de Veterinarios.

## 3. Controladores del API REST

- [ ] 3.1 Crear `PropietariosController` en `PetClinic.Api/Controllers/` con endpoints CRUD protegidos con `[Authorize(Roles = "Administrador")]`.
- [ ] 3.2 Crear `VeterinariosController` in `PetClinic.Api/Controllers/` con endpoints CRUD y restricción por rol.
- [ ] 3.3 Habilitar middleware `IHttpContextAccessor` si no estuviese totalmente integrado para asegurar la inyección de shadow properties.

## 4. Frontend SPA CRUD de Gestión

- [ ] 4.1 Crear la página de gestión de Propietarios `Owners.tsx` en `src/PetClinic.Web/src/pages/` con búsqueda, tabla paginada y modal de formulario.
- [ ] 4.2 Crear la página de gestión de Veterinarios `Veterinarians.tsx` en `src/PetClinic.Web/src/pages/` con listado de tarjetas y modal de formulario.
- [ ] 4.3 Reemplazar las referencias de `Placeholder` por los nuevos componentes `Owners` y `Veterinarians` en `App.tsx` del frontend.

## 5. Compilación, Validación y Documentación

- [ ] 5.1 Ejecutar `dotnet build` en la raíz para validar la compilación limpia.
- [ ] 5.2 Ejecutar `dotnet test` para verificar las pruebas unitarias y de integración de persistencia.
- [ ] 5.3 Actualizar el documento de diseño de arquitectura global `architecture.md` con los detalles técnicos del Sprint 3.
