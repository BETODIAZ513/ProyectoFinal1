## Why

El sistema requiere gestionar los pacientes clínicos (Mascotas) y llevar un historial detallado de sus variaciones de peso a lo largo del tiempo, de acuerdo al Módulo 2 de la ERS. El registro de peso debe quedar exento de la auditoría automática pasiva según REQ-SEG-03.

## What Changes

- **Backend (`PetClinic.Domain`, `PetClinic.Application`, `PetClinic.Infrastructure`, `PetClinic.Api`)**:
  - Definición de las entidades `Mascota` (relacionada con un `Propietario` mediante FK) y `RegistroPeso` (relacionada con una `Mascota`).
  - Implementación de casos de uso (MediatR commands/queries) para el CRUD de Mascotas y el registro de variaciones de peso.
  - Asegurar en `PetClinicDbContext` que la entidad `RegistroPeso` esté excluida del interceptor automático de shadow properties (`CreatedBy`, `CreatedAt`, `UpdatedAt`) de acuerdo a la restricción REQ-SEG-03.
  - Exposición de endpoints REST correspondientes (`api/mascotas` y `api/mascotas/{id}/pesos`) bajo autorización.
- **Frontend (`PetClinic.Web`)**:
  - Creación de la pantalla de gestión de Mascotas (`Pets.tsx`) y la vista de ficha clínica detallada por paciente.
  - Incorporación de la visualización y registro histórico del peso en forma de listado/gráficos simples.

## Capabilities

### New Capabilities
- `pet-management`: CRUD de perfiles de Mascotas vinculados a un Propietario.
- `weight-tracking`: Historial de registro de variaciones de peso para pacientes, excluido de la auditoría pasiva.

### Modified Capabilities
<!-- None -->

## Impact

Este cambio introduce las tablas `Mascotas` y `RegistroPeso` en base de datos. Modifica el DbContext y los controladores API para posibilitar el registro clínico de pacientes, habilitando el posterior agendamiento de citas en los sprints de negocio siguientes.
