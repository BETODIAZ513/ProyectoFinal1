## Why

El sistema requiere coordinar el internamiento y cuidado clínico de mascotas enfermas (Módulo 6 de la ERS) registrando admisiones a jaulas de hospitalización, monitoreos de signos vitales (temperatura rectal, frecuencias cardíaca y respiratoria, nivel de alerta) y las correspondientes altas médicas.

## What Changes

- **Backend (`PetClinic.Domain`, `PetClinic.Application`, `PetClinic.Infrastructure`, `PetClinic.Api`)**:
  - Definición de las entidades `Hospitalizacion` y `MonitoreoClinico`.
  - Configuración de mappings ORM con auditoría pasiva habilitada.
  - Implementación de casos de uso (CQRS con MediatR) para el ingreso, registro de monitoreo y alta de pacientes.
  - Exposición de endpoints REST bajo `/api/hospitalizaciones` y `/api/hospitalizaciones/{id}/monitoreos`.
- **Frontend (`PetClinic.Web`)**:
  - Creación del panel de hospitalización interactivo (`Hospitalization.tsx`) que permite admitir pacientes, listar internados, registrar monitoreos y dar de alta.
  - Integración del enrutamiento real en `App.tsx` reemplazando los placeholders para `/hospitalizacion`.

## Capabilities

### New Capabilities
- `hospitalization-records`: Flujo de internamiento, asignación de jaula y altas médicas.
- `clinical-monitoring`: Historial de monitoreos de signos vitales e indicadores para pacientes hospitalizados.

### Modified Capabilities
<!-- None -->

## Impact

Este cambio introduce las tablas `Hospitalizaciones` y `MonitoreosClinicos` en la base de datos, y permite a veterinarios y auxiliares monitorear la evolución física y clínica de los pacientes internados de manera centralizada.
