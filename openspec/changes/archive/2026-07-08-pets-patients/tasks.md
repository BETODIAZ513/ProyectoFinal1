## 1. Modelado de Dominio y Persistencia

- [ ] 1.1 Crear la clase de entidad `Mascota` en `PetClinic.Domain/Entities/Mascota.cs`.
- [ ] 1.2 Crear la clase de entidad `RegistroPeso` en `PetClinic.Domain/Entities/RegistroPeso.cs`.
- [ ] 1.3 Agregar `DbSet<Mascota>` y `DbSet<RegistroPeso>` a `IPetClinicDbContext.cs` y `PetClinicDbContext.cs`.
- [ ] 1.4 Configurar relaciones (FK) y llaves en `OnModelCreating` en `PetClinicDbContext`.

## 2. Casos de Uso (CQRS con MediatR y FluentValidation)

- [ ] 2.1 Crear Commands para `Mascota` (`CreatePetCommand`, `UpdatePetCommand`, `DeletePetCommand` para baja lógica).
- [ ] 2.2 Crear Queries para `Mascota` (`GetPetByIdQuery`, `GetPetsPagedQuery` con soporte de búsquedas y ordenamientos).
- [ ] 2.3 Crear validadores FluentValidation para Mascotas (campos obligatorios, fechas lógicas).
- [ ] 2.4 Crear Command para `RegistroPeso` (`CreateWeightRecordCommand` con validación de peso > 0).
- [ ] 2.5 Crear Query para `RegistroPeso` (`GetWeightHistoryQuery` para obtener el historial clínico de pesaje del paciente).
- [ ] 2.6 Crear validador FluentValidation para el pesaje.

## 3. Controladores de la API REST

- [ ] 3.1 Crear `MascotasController` en `PetClinic.Api/Controllers/` exponiendo CRUD de mascotas y los endpoints de pesos (`GET /api/mascotas/{id}/pesos` y `POST /api/mascotas/{id}/pesos`).

## 4. Frontend SPA Vistas de Pacientes y Ficha Clínica

- [ ] 4.1 Crear la página `Pets.tsx` en `src/PetClinic.Web/src/pages/` que liste las mascotas (tabla con búsquedas por mascota/dueño y filtros).
- [ ] 4.2 Desarrollar el modal o vista de Ficha Clínica Detallada dentro de `Pets.tsx` (que despliega datos del paciente, dueño e historial de peso interactivo para registrar variaciones de peso).
- [ ] 4.3 Reemplazar las referencias de `Placeholder` por el componente `Pets` en `App.tsx` del frontend.

## 5. Compilación, Validación y Documentación

- [ ] 5.1 Ejecutar `dotnet build` en la raíz para validar la compilación limpia.
- [ ] 5.2 Ejecutar `dotnet test` para asegurar la integridad de las pruebas.
- [ ] 5.3 Actualizar el documento de arquitectura global `architecture.md` con los detalles técnicos del Sprint 4.
