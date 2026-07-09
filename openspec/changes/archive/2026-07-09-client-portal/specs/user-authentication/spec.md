## ADDED Requirements

### Requirement: Registro de Cuentas de Propietario
El sistema SHALL permitir vincular una cuenta de usuario del portal a un perfil de `Propietario` existente utilizando su correo electrónico.

#### Scenario: Creación exitosa de cuenta del portal
- **WHEN** un cliente se registra en el portal utilizando su correo electrónico registrado en la clínica y una nueva contraseña
- **THEN** el sistema crea la cuenta de usuario con el rol de "Propietario" vinculada a su `PropietarioId`

### Requirement: Restricción de Contexto por Token (JWT Claims)
El sistema SHALL incluir el claim `PropietarioId` en el token JWT emitido para los usuarios con el rol de "Propietario", permitiendo restringir el contexto del API a sus propios datos.

#### Scenario: Emisión de token para propietario
- **WHEN** un usuario con rol de "Propietario" inicia sesión correctamente
- **THEN** el token JWT resultante contiene el claim `PropietarioId` correspondiente a su perfil
