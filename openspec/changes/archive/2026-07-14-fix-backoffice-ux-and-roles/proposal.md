## Why

Existen varios problemas de usabilidad, seguridad y consistencia en el Backoffice de la clínica veterinaria:
1. El panel de inicio (Dashboard) para el rol de Auxiliar Clínico genera una pantalla negra (crash de renderizado) debido al intento de lectura de propiedades inexistentes en las tareas médicas.
2. Los roles de Auxiliar Clínico y Veterinario carecen de validación de rutas y botones de navegación a nivel del menú superior (Ribbon Menu) para secciones críticas que sí les competen (como Mascotas o Tareas Médicas), y pueden acceder a rutas para las cuales no están autorizados (como /veterinarios) digitando la URL directamente.
3. El Recepcionista no cuenta con acceso directo para registrar mascotas, y las bandejas clínicas y botones de sincronización carecen de retroalimentación de errores.
4. El Backoffice no ofrece la opción de alternar entre modo de visualización Día/Noche.

## What Changes

- **Modificación en App.tsx (Rutas Protegidas)**: Implementación de un componente `RoleRoute` que valide los roles del usuario antes de permitir el renderizado de la página, redirigiendo a `/inicio` en caso de accesos no autorizados.
- **Modificación en RibbonMenu.tsx (Navegación Dinámica)**: 
  - Mostrar la pestaña "Mascotas" a todos los roles (Administrador, Recepcionista, Veterinario, Auxiliar Clínico) para permitir búsquedas y perfiles de pacientes.
  - Mostrar la pestaña "Tareas Médicas" y "Hospitalización" al rol Veterinario además del Auxiliar Clínico.
  - Mostrar pestañas de administración secundaria (Propietarios, Mascotas, Citas, Historial) al Recepcionista.
  - Incorporación de un botón toggle de tema Día/Noche en la barra superior.
- **Modificación en Home.tsx (Dashboard del Auxiliar)**: Corrección de las referencias a `prioridad` y `completado` en las tareas del dashboard, previniendo excepciones por valores nulos o indefinidos.
- **Mejora en Consultas.tsx y Hospitalization.tsx**: Incorporación de alertas visuales en los catch de los métodos de sincronización para que el usuario conozca si ocurrió un error en la comunicación con el API.
- **Estilos de Modo Claro (index.css)**: Implementación de selectores bajo la clase `.light` para ofrecer una interfaz diurna impecable en el Backoffice.

## Capabilities

### New Capabilities
<!-- Ninguna nueva capacidad de API. Ajustes exclusivos a nivel de interfaz de usuario del Backoffice. -->

### Modified Capabilities
<!-- No se modifican contratos de API o especificaciones funcionales generales. -->

## Impact

- **PetClinic.Web (Frontend)**: Afecta a `App.tsx`, `index.css`, `components/RibbonMenu.tsx`, `pages/Home.tsx`, `pages/Consultations.tsx` y `pages/Hospitalization.tsx`.
