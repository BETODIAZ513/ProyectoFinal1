## ADDED Requirements

### Requirement: Validación de Casos Clínicos en Pruebas
Las pruebas unitarias SHALL validar los escenarios críticos de la lógica de negocio del sistema, incluyendo solapamientos, jaulas únicas, auditorías de seguridad, creación de perfiles y lógica de consultas de lectura.

#### Scenario: Verificar consulta de historial clínico de mascotas
- **WHEN** un test invoca `GetClinicalHistoryQuery` para una mascota
- **THEN** la consulta debe retornar únicamente las atenciones médicas y diagnósticos vinculados a esa mascota

#### Scenario: Verificar bloqueo de mascota para propietario inactivo
- **WHEN** se intenta crear una mascota
- **THEN** la capa de aplicación debe asegurar que el propietario esté activo

#### Scenario: Verificar validadores de creación de propietario
- **WHEN** se envía un comando `CreateOwnerCommand` con datos incompletos
- **THEN** el validador FluentValidation debe arrojar errores correspondientes a los campos requeridos
