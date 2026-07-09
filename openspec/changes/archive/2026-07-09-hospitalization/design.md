## Context

El personal clínico necesita un registro de hospitalizaciones y monitoreos de signos vitales para mascotas que requieren observación constante (Módulo 6 de la ERS). Se necesita registrar admisiones, parámetros corporales (temperatura, frecuencia cardíaca, respiratoria) y controlar las altas.

## Goals / Non-Goals

**Goals:**
- Definir las entidades `Hospitalizacion` y `MonitoreoClinico` en `PetClinic.Domain` con sus mapeos relacionales en EF Core.
- Habilitar la auditoría pasiva en ambas tablas.
- Implementar los casos de uso CQRS para admisiones, registro de parámetros y altas de internados.
- Crear la pantalla interactiva `Hospitalization.tsx` en el cliente React, permitiendo registrar ingresos, monitoreos y altas con visualización de telemetría histórica.

**Non-Goals:**
- Integración física con dispositivos IoT de monitoreo de signos vitales automáticos.

## Decisions

### 1. Entidades y Auditoría Pasiva
- **Decisión**: Ambas entidades recibirán propiedades de sombra de auditoría automática (`CreatedBy`, `CreatedAt`, `UpdatedAt`) al no estar en la lista de exclusiones.
- **Razón**: Permite llevar un log detallado de quién hospitalizó y quién registró cada monitoreo clínico de acuerdo con `REQ-SEG-03`.

### 2. Identificación del Clínico Registrador de Signos Vitales
- **Decisión**: La entidad `MonitoreoClinico` incluirá un campo `RegistradoPor` (string) que almacenará el nombre completo o username del usuario logueado en la aplicación al momento de enviar los datos.
- **Razón**: Evita la necesidad de crear perfiles adicionales (ej: Auxiliares) en base de datos, soportando cualquier rol que ingrese la información.

### 3. Registro de Temperatura y Constantes
- **Decisión**: `Temperatura` será de tipo `decimal` (precisión de décimas de grado Celsius) y las frecuencias cardíaca y respiratoria serán de tipo `int`.
- **Razón**: Se alinea con los estándares clínicos de medición de signos vitales en medicina veterinaria.

## Risks / Trade-offs

- **[Riesgo] Jaula ocupada por mascota fantasma**: Que se intente registrar más de una mascota en la misma jaula simultáneamente.
  - *Mitigación*: Se validará en el comando de admisión que el número de jaula no se encuentre ocupado por ningún paciente con estado "Internado".
