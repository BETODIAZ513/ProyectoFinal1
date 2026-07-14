## Context

El Backoffice (`PetClinic.Web`) requiere ajustes urgentes de robustez en el renderizado del dashboard (que se cae en pantalla negra para el auxiliar), control de acceso por roles en rutas del cliente de React y habilitación del modo de visualización claro/oscuro (Día/Noche).

## Goals / Non-Goals

**Goals:**
- Asegurar que el dashboard del Auxiliar Clínico cargue y renderice correctamente.
- Proteger las rutas privadas según los roles autorizados en el frontend de React.
- Permitir la visualización en Modo Claro (Día) alternable desde el menú superior Ribbon.
- Dar acceso de gestión de mascotas al Recepcionista, Veterinario y Auxiliar.
- Capturar y reportar errores en las consultas de sincronización de bandejas clínicas.

**Non-Goals:**
- Modificar el sistema de base de datos o esquemas de las tablas.
- Implementar controles de roles avanzados del lado del servidor que no estén ya especificados.

## Decisions

### 1. Control de Rutas Protegidas en React Router
- **Decisión**: Crear un componente `RoleRoute` en `App.tsx` que reciba una lista de `allowedRoles`. Si el usuario no cuenta con la sesión iniciada o con alguno de los roles de la lista, será redirigido a `/inicio`.
- **Alternativa**: Cargar la validación dentro de cada página individualmente. Se descarta para evitar duplicación de código y mantener una estructura declarativa limpia en las rutas de React.

### 2. Implementación de Día/Noche en Backoffice
- **Decisión**: Utilizar una clase `.light` en `document.body` y variables/selectores globales en `index.css`. Toggling se maneja con un botón en `RibbonMenu.tsx` y se persiste en `localStorage` (bajo la llave `"theme"`).
- **Alternativa**: Modificar los archivos de estilo inline `<style>` de cada una de las 10 páginas. Se descarta debido al alto riesgo de regresiones visuales y al esfuerzo ineficiente de editar miles de líneas de CSS locales.

## Risks / Trade-offs

- **[Riesgo]**: Algunas vistas específicas podrían conservar contrastes oscuros residuales si usan propiedades de estilo directas sin clases heredadas.
  - **Mitigación**: Se definieron selectores específicos exhaustivos en `index.css` para cubrir tarjetas, inputs, tablas y modales en modo claro.
