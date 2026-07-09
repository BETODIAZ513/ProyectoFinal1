## ADDED Requirements

### Requirement: Autenticación mediante Firebase (Google Login)
El sistema SHALL permitir a los usuarios autenticarse utilizando Firebase Google Authentication, extrayendo el ID Token (JWT) firmado para validar la sesión en el Backend.

#### Scenario: Autenticación con cuenta de Google vinculada
- **WHEN** un propietario hace clic en "Ingresar con Google" y la autenticación es exitosa
- **THEN** Firebase devuelve un ID Token y el backend permite el acceso si la cuenta ya está vinculada a un cliente activo

### Requirement: Enlace y Validación mediante OTP
El sistema SHALL permitir vincular una sesión de Google/Firebase a un perfil de `Propietario` preexistente mediante la validación de un código OTP de 6 dígitos con expiración de 150 segundos.

#### Scenario: Vinculación exitosa usando código OTP
- **WHEN** un usuario ingresa un código de 6 dígitos válido y no expirado recibido presencialmente
- **THEN** el sistema asocia su Firebase UserId a su registro de `Propietario` y marca su perfil como verificado (`Activo = true`) inmediatamente
