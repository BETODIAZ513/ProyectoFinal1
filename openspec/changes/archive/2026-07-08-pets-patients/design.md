## Context

La veterinaria requiere el registro clínico de los animales domésticos (pacientes) y el seguimiento histórico de su peso corporal, que es una métrica clave para diagnósticos. Es imperativo mapear estas entidades y posibilitar la desactivación lógica de las mascotas al ser eliminadas, además de respetar la exclusión de auditoría transaccional para el registro del peso.

## Goals / Non-Goals

**Goals:**
- Crear las entidades de dominio `Mascota` y `RegistroPeso`.
- Mapear las tablas de base de datos correspondientes y agregarlas a la interfaz `IPetClinicDbContext`.
- Configurar las exclusiones de auditoría automática (shadow properties) para la clase `RegistroPeso` de acuerdo a `REQ-SEG-03` (ya integrado en DbContext).
- Implementar los casos de uso (Commands/Queries con MediatR) en la capa de Application para administrar Mascotas y añadir variaciones de peso.
- Desarrollar la interfaz web (SPA) en React para gestionar la ficha de mascotas, el listado general y el perfil clínico del paciente (con el historial de peso).

**Non-Goals:**
- Módulo de citas o historial de consultas médicas (se abordarán en sprints futuros).

## Decisions

### 1. Modelado de Pacientes (Mascota)
- **Decisión**: La entidad `Mascota` tendrá relaciones de clave foránea enteras con `Propietario` (`PropietarioId`). Tendrá campos como `Especie` (ej: Canino, Felino), `Raza`, `FechaNacimiento`, `Sexo` (Macho/Hembra), `Color`, y `Activo` (para baja lógica).
- **Razón**: Permite catalogar con exactitud los datos clínicos básicos del paciente.

### 2. Historial de Variaciones de Peso (RegistroPeso)
- **Decisión**: Crear una entidad `RegistroPeso` asociada 1:N con `Mascota` conteniendo `FechaRegistro` y `PesoKg`.
- **Razón**: Se requiere graficar o listar la fluctuación del peso para consultas veterinarias.

### 3. Exclusión de Auditoría Pasiva en Pesos
- **Decisión**: Mantener excluida la entidad `RegistroPeso` de la inyección automática de propiedades de sombra (`CreatedBy`, `CreatedAt`, `UpdatedAt`) en `PetClinicDbContext.cs`.
- **Razón**: Cumple estrictamente con el requerimiento normativo `REQ-SEG-03` de auditoría pasiva.

### 4. Perfil Clínico Unificado en el Frontend
- **Decisión**: Crear una vista de detalle del paciente (Clinical Chart) que consolide en una sola pantalla los datos demográficos de la mascota, los datos de contacto de su dueño (Propietario), y su historial de peso completo con opción de registrar un nuevo pesaje.
- **Razón**: Mejora radicalmente la experiencia del usuario (veterinarios y auxiliares) al tener la información clínica unificada en un solo vistazo.

## Risks / Trade-offs

- **[Riesgo] Registro de peso huérfano**: Intentar ingresar un peso para una mascota inactiva o inexistente.
  - *Mitigación*: Se validará en el Handler de creación de peso que la mascota exista y se encuentre activa antes de guardar el registro en base de datos.
