## ADDED Requirements

### Requirement: Acceso Limitado a Mascotas Propias
El Portal de Clientes SHALL permitir al Propietario visualizar únicamente la información de las mascotas asociadas a su `PropietarioId`.
- **Datos Visibles:** Nombre, especie, raza, sexo, color y fecha de nacimiento.
- **Datos Ocultos:** Información de otros propietarios o mascotas no relacionadas.

#### Scenario: Visualizar listado de mascotas propias
- **WHEN** el Propietario inicia sesión en el Portal de Clientes
- **THEN** el sistema muestra un listado con todas las mascotas asociadas a su PropietarioId, ocultando las mascotas de otros propietarios

### Requirement: Consulta de Historial Médico y de Peso
El Portal de Clientes SHALL permitir al Propietario consultar el historial clínico (fecha, diagnóstico y tratamiento) y el historial de peso de sus mascotas.
- **Datos Ocultos:** Notas clínicas internas de los veterinarios que no conciernan al propietario.

#### Scenario: Consultar historial clínico y peso de una mascota propia
- **WHEN** el Propietario selecciona una de sus mascotas
- **THEN** el sistema muestra el historial de diagnósticos/tratamientos y los registros de peso ordenados de forma cronológica descendente

### Requirement: Visualizar Estado de Hospitalización
El Portal de Clientes SHALL permitir al Propietario visualizar el estado de hospitalización activo de sus mascotas (si se encuentra internada, la jaula y el motivo).

#### Scenario: Visualizar estado de hospitalización activo
- **WHEN** la mascota del Propietario se encuentra en estado "Internado"
- **THEN** el portal muestra de manera destacada un indicador de hospitalización con la jaula y el motivo correspondiente

### Requirement: Menú de Navegación del Portal
La interfaz de usuario del Portal de Clientes SHALL proveer un menú de navegación que contenga las siguientes opciones:
- **Mis Mascotas (Dashboard):** Activo, muestra el listado y detalle de mascotas.
- **Reservar Cita (Sacar Cita):** Deshabilitado/Placeholder, indicando que estará disponible próximamente.
- **Tienda:** Deshabilitado/Placeholder, indicando que estará disponible próximamente.

#### Scenario: Visualizar menú de navegación en móvil
- **WHEN** el Propietario abre el menú del portal en su teléfono
- **THEN** el sistema despliega las opciones de Mis Mascotas, Reservar Cita (deshabilitado) y Tienda (deshabilitado)

### Requirement: Soporte para Modo Día y Noche
El Portal de Clientes SHALL permitir al usuario alternar la interfaz gráfica entre un tema claro (Modo Día) y un tema oscuro (Modo Noche) mediante un botón selector accesible en todo momento.

#### Scenario: Alternar a modo noche
- **WHEN** el Propietario hace clic en el selector de tema
- **THEN** el sistema cambia los colores del fondo y los textos a la paleta de modo noche, guardando la preferencia del usuario en almacenamiento local
