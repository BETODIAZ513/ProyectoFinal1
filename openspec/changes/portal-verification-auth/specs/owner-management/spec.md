## ADDED Requirements

### Requirement: Generación de Código OTP para Vinculación Presencial
El personal de la clínica (recepcionista/administrador) SHALL poder generar en el Backoffice un código único temporal de 6 dígitos asociado a la cuenta de un propietario para permitir su verificación inmediata en el portal.

#### Scenario: Generación exitosa de código de 6 dígitos
- **WHEN** la recepcionista solicita generar un código de acceso para un propietario verificado presencialmente
- **THEN** el sistema genera un código numérico aleatorio de 6 dígitos, establece su expiración en 150 segundos y lo guarda en la base de datos
