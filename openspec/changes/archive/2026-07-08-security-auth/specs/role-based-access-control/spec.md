## ADDED Requirements

### Requirement: Restricción de Rutas por Rol
El sistema SHALL restringir el acceso a controladores, endpoints y rutas según el rol asignado al usuario, bloqueando los accesos no autorizados.

#### Scenario: Acceso denegado a ruta prohibida en la API
- **WHEN** un usuario con rol "Recepcionista" intenta realizar una petición HTTP a un endpoint reservado para "Administrador"
- **THEN** la API debe retornar un código de estado HTTP 403 Forbidden

#### Scenario: Navegación forzada rechazada en el frontend
- **WHEN** un usuario con rol "Veterinario" ingresa directamente a la URL de administración `/propietarios` en el navegador
- **THEN** el frontend SPA debe bloquear la renderización de la página y redirigirlo a la vista `/inicio` o mostrar una alerta de no autorizado

### Requirement: Renderizado Condicional del Ribbon Menu
El menú superior tipo cinta (Ribbon Menu) SHALL mostrar únicamente los enlaces e ítems correspondientes al rol del usuario autenticado para garantizar el aislamiento visual.

#### Scenario: Menú visible para Auxiliar Clínico
- **WHEN** un usuario con rol "AuxiliarClinico" inicia sesión y visualiza la cabecera
- **THEN** el menú debe mostrar los enlaces "Inicio" y "Hospitalización", y ocultar los enlaces de "Propietarios" y "Mascotas"

### Requirement: Dashboards Dinámicos de Inicio
La pantalla principal `/Inicio` SHALL cargar de manera dinámica el dashboard específico que le corresponde al rol del usuario autenticado.

#### Scenario: Dashboard para Administrador
- **WHEN** el Administrador accede a la pantalla de inicio
- **THEN** la interfaz debe cargar métricas globales, citas de la semana y el listado de próximas citas
