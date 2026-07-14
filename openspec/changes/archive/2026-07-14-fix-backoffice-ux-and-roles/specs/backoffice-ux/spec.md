## ADDED Requirements

### Requirement: Role-based view authorization
The backoffice application SHALL restrict navigation and access to pages based on the user's role:
- /veterinarios: SHALL be restricted to Administrador
- /propietarios: SHALL be restricted to Administrador and Recepcionista
- /mascotas: SHALL be accessible to Administrador, Recepcionista, Veterinario and AuxiliarClinico
- /citas: SHALL be restricted to Administrador and Recepcionista
- /recepcion: SHALL be restricted to Administrador and Recepcionista
- /consultas: SHALL be restricted to Administrador and Veterinario
- /historial-clinico: SHALL be restricted to Administrador, Veterinario and AuxiliarClinico
- /tareas-medicas: SHALL be restricted to Administrador, Veterinario and AuxiliarClinico
- /hospitalizacion: SHALL be restricted to Administrador, Veterinario and AuxiliarClinico

#### Scenario: Unauthorized route access redirection
- **WHEN** a user logs in and attempts to access an unauthorized route
- **THEN** the application SHALL redirect the user to the /inicio page

### Requirement: Day/Night mode toggling
The backoffice application SHALL allow users to toggle between Day (Light) and Night (Dark) visual themes.

#### Scenario: Toggle theme persistency
- **WHEN** the user clicks the theme toggle button in the Ribbon Menu
- **THEN** the application SHALL update the visual theme and save the preference in localStorage
