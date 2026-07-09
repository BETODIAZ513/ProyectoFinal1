## Context

El sistema veterinario necesita persistir la bitácora médica de cada consulta realizada, la cual debe estar asociada al paciente y al profesional que la administró, sirviendo como insumo primario para el Módulo 3.

## Goals / Non-Goals

**Goals:**
- Crear la entidad `DetalleConsulta` para albergar notas clínicas, diagnósticos y prescripciones médicas.
- Diseñar comandos para almacenar bitácoras de consulta y atar esta operación a la transición de estado `Completada` de la Cita de manera secuencial o transaccional.
- Proveer queries para consultar el historial de consultas de un paciente y el listado de auditoría histórica global de citas.
- Completar las pantallas React del frontend para el visor global de citas e historias médicas.

**Non-Goals:**
- Módulo de facturación o venta de medicamentos (fuera del alcance del núcleo clínico).

## Decisions

### 1. Modelado de Detalle de Consulta
- **Decisión**: La entidad `DetalleConsulta` tendrá propiedades: `Id`, `CitaId` (FK), `MascotaId` (FK), `VeterinarioId` (FK), `FechaAtencion` (DateTime), `Diagnostico` (string), `Tratamiento` (string) y `NotasAdicionales` (string, opcional).
- **Razón**: Almacena de manera granular y estructurada las intervenciones veterinarias en cumplimiento con la ERS.

### 2. Flujo Integrado de Cierre de Consulta
- **Decisión**: Cuando el Veterinario finalice la consulta en el frontend, el command enviará tanto el diagnóstico/tratamiento como el cambio de estado de la cita. El backend insertará el `DetalleConsulta` y actualizará el estado de la cita a `Completada` en el mismo caso de uso de manera transaccional.
- **Razón**: Previene inconsistencias en la base de datos (por ejemplo, citas completadas sin su correspondiente bitácora clínica).

### 3. Ficha Clínica Integral en el Buscador
- **Decisión**: La página `/historial-clinico` permitirá buscar mascotas activas o inactivas, y al seleccionar una de ellas, recuperará en paralelo:
  - Información demográfica de la mascota y datos de contacto de su dueño.
  - Historial completo de pesajes (Sprint 4).
  - Listado cronológico de diagnósticos, tratamientos y notas registrados por los veterinarios (Sprint 6).
- **Razón**: Centraliza toda la historia de vida clínica del animal en una única vista unificada y de fácil lectura para el personal clínico.

## Risks / Trade-offs

- **[Riesgo] Citas completadas sin diagnóstico**: Si un usuario completa la cita por API directamente sin registrar detalles.
  - *Mitigación*: Se validará en el Handler de actualización de estado que si la cita transiciona a "Completada", es obligatorio proveer la información diagnóstica básica.
