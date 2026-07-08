## ADDED Requirements

### Requirement: CRUD de Veterinarios
El Administrador SHALL poder crear, consultar, editar y desactivar perfiles de veterinarios en el sistema.

#### Scenario: Creación exitosa de perfil de Veterinario
- **WHEN** el Administrador completa el formulario con datos válidos (nombre, especialidad, colegiatura, correo) y guarda
- **THEN** el sistema debe registrar el perfil de veterinario y asignarle un identificador único

### Requirement: Creación de Cuenta Simultánea
Al crear un perfil de veterinario, el sistema SHALL crear simultáneamente una cuenta de acceso (`ApplicationUser`) asociada al correo electrónico ingresado y asignarle el rol de "Veterinario".

#### Scenario: Sincronización con Identity al crear
- **WHEN** se guarda un nuevo veterinario con correo "perez@petclinic.com"
- **THEN** se debe registrar un usuario en Identity con nombre de usuario "perez@petclinic.com", asignarle la contraseña por defecto y agregarlo al rol de "Veterinario"

### Requirement: Exclusión de Veterinarios Inactivos
Un veterinario cuyo perfil esté marcado como inactivo SHALL ser excluido de los selectores de agendamiento de nuevas citas para evitar asignaciones erróneas.

#### Scenario: Visualización en el selector de citas
- **WHEN** se despliega el listado de veterinarios en el formulario de agendamiento
- **THEN** solo deben mostrarse aquellos veterinarios que tengan el estado activo
