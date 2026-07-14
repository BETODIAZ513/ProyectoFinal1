## Why

Los diferentes roles de la clínica (Administrador, Veterinario, Auxiliar Clínico y Recepcionista) necesitan visualizar y gestionar los horarios de atención y turnos laborales:
1. El Veterinario requiere ver su agenda de citas del día/semana y la opción de auto-agendar citas en horarios disponibles.
2. El Auxiliar Clínico requiere consultar su propio turno asignado y el de los veterinarios para coordinar asistencias en cirugías o consultas.
3. El Administrador y el Recepcionista necesitan supervisar las agendas globales y turnos de todo el personal.

## What Changes

- **Nuevo Componente Schedules.tsx**: Página principal de visualización de agendas en formato de calendario/cronograma diario.
- **Ruta en App.tsx**: Registrar la ruta `/horarios` bajo un guardián de roles genérico que admita a todos los roles.
- **Opción en RibbonMenu.tsx**: Incorporar la pestaña "Horarios" en la barra de navegación para todos los roles del Backoffice.
- **Especificación spec.md**: Definir las reglas de visualización y agendamiento directo desde la agenda.

## Capabilities

### New Capabilities
<!-- Ninguna nueva capacidad de API. Ajustes a nivel de interfaz. -->

### Modified Capabilities
<!-- No se modifican contratos. -->

## Impact

- **PetClinic.Web**:
  - `src/App.tsx`
  - `src/components/RibbonMenu.tsx`
  - `src/pages/Schedules.tsx` [NEW]
