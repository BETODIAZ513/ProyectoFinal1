## 1. Cambios en el Backend (C# / API)

- [x] 1.1 Implementar la consulta `GetAppointmentsByVetIdQuery` y su handler en `AppointmentQueries.cs` para obtener citas de un veterinario específico por ID.
- [x] 1.2 Modificar el endpoint de citas por veterinario en `CitasController.cs` para admitir roles de Recepcionista y Auxiliar, y permitir filtrar por query parameter `veterinarioId`.
- [x] 1.3 Permitir al rol `Veterinario` agendar citas modificando los roles autorizados en `POST /api/citas` de `CitasController.cs`.

## 2. Cambios en el Frontend (React / Backoffice)

- [x] 2.1 Agregar la ruta `/horarios` protegida por todos los roles (`Administrador`, `Recepcionista`, `Veterinario`, `AuxiliarClinico`) en `App.tsx`.
- [x] 2.2 Agregar la pestaña "Horarios" en la barra de navegación para todos los roles en `RibbonMenu.tsx`.
- [x] 2.3 Crear el nuevo componente `Schedules.tsx` en `src/PetClinic.Web/src/pages/Schedules.tsx` para visualizar turnos y agendar citas médicas con la validación de solapamiento.
