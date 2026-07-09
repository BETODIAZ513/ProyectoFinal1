## Context

El personal auxiliar veterinario requiere un gestor visual de tareas clínicas (Tablero Kanban) para coordinar los tratamientos y atenciones hospitalarias. Se requiere catalogar tareas predefinidas estáticas y registrar tareas dinámicas ligadas a los pacientes.

## Goals / Non-Goals

**Goals:**
- Definir las entidades `TareaPredefinida` y `TareaClinica` en `PetClinic.Domain` y sus mapeos ORM.
- Respetar la exclusión de auditoría automática transaccional para `TareaPredefinida` según `REQ-SEG-03`.
- Implementar los casos de uso CQRS para crear tareas clínicas dinámicas y actualizar sus estados.
- Desarrollar la interfaz web (Tablero Kanban) en React que clasifique las tareas en columnas: Pendiente, En Progreso, Completada, con botones para transicionar estados.

**Non-Goals:**
- Módulo de chat interno o mensajería en tiempo real entre auxiliares y veterinarios.

## Decisions

### 1. Modelado de Tarea Predefinida (Catálogo)
- **Decisión**: La entidad `TareaPredefinida` constará de `Id`, `Nombre` y `Descripcion`.
- **Razón**: Permite estandarizar los nombres de tareas comunes (ej: "Colocación de catéter", "Monitoreo de temperatura") agilizando el registro.

### 2. Exclusión de Auditoría Pasiva en Tareas Predefinidas
- **Decisión**: Mantener a `TareasPredefinidas` excluida de la inyección automática de propiedades de sombra (`CreatedBy`, `CreatedAt`, `UpdatedAt`) en `PetClinicDbContext.cs`.
- **Razón**: Satisface el requerimiento de seguridad `REQ-SEG-03`.

### 3. Modelado de Tarea Clínica
- **Decisión**: La entidad `TareaClinica` tendrá campos: `Id`, `Titulo` (obligatorio), `Descripcion`, `Estado` (`Pendiente`, `En Progreso`, `Completada`), `MascotaId` (FK), `VeterinarioId` (FK, quien crea la tarea) y `CitaId` (FK, opcional).
- **Razón**: Vincula la tarea a un paciente y a una orden médica médica específica.

### 4. Tablero Kanban Interactivo
- **Decisión**: Crear una vista Kanban en React `/tareas-medicas` dividida en tres columnas (Pendiente, En Progreso, Completada). Mostrar tarjetas con los detalles de la mascota y permitir arrastrar/transicionar el estado mediante botones de acción rápida.
- **Razón**: Ofrece al personal auxiliar clínico una herramienta ergonómica de control operativo.

## Risks / Trade-offs

- **[Riesgo] Tareas huérfanas en Kanban**: Tableros saturados de tareas completadas de meses anteriores.
  - *Mitigación*: La query de obtención de tareas para el tablero Kanban filtrará y mostrará únicamente aquellas creadas en las últimas 48 horas o cuyo estado sea diferente de "Completada", optimizando el rendimiento y limpieza visual.
