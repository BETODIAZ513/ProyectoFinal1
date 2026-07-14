## 1. Correcciones de Renderizado del Dashboard y UI Robustness

- [x] 1.1 Corregir el dashboard del Auxiliar Clínico en `Home.tsx` para eliminar referencias a `task.prioridad` y usar `t.estado !== "Completada"` en lugar de `!t.completado`.
- [x] 1.2 Añadir captura de errores con alertas visuales en las sincronizaciones asíncronas de `Consultations.tsx` y `Hospitalization.tsx`.

## 2. Validación de Rutas y Menú por Roles

- [x] 2.1 Crear el componente `RoleRoute` en `App.tsx` para bloquear accesos directos por URL basados en roles.
- [x] 2.2 Reestructurar las rutas de `App.tsx` para aplicar `RoleRoute` de forma restrictiva según el rol de usuario.
- [x] 2.3 Modificar `RibbonMenu.tsx` para habilitar las pestañas correspondientes de Mascotas, Hospitalizaciones, Citas y Tareas Médicas a los roles de Recepcionista, Veterinario y Auxiliar Clínico.

## 3. Modo Claro / Oscuro (Día/Noche)

- [x] 3.1 Agregar toggle de tema en la sección de usuario de `RibbonMenu.tsx` con persistencia en `localStorage`.
- [x] 3.2 Implementar los estilos de anulación global `.light` en `index.css` para soportar completamente el modo claro en el Backoffice.
