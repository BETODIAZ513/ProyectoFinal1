## ADDED Requirements

### Requirement: Registro de Historial de Peso
El personal clínico (Veterinarios y Auxiliares) SHALL poder registrar variaciones de peso de un paciente a lo largo del tiempo ingresando el peso en kilogramos y la fecha del pesaje.

#### Scenario: Registrar un peso válido
- **WHEN** el Auxiliar registra un peso de 12.5 kg para una mascota activa
- **THEN** el sistema debe almacenar el pesaje en el historial clínico del paciente

### Requirement: Validación de Peso Positivo
El valor numérico de peso ingresado en el sistema SHALL ser mayor que cero para considerarse válido.

#### Scenario: Intento de registro de peso menor o igual a cero
- **WHEN** el Auxiliar clínico intenta guardar un peso de -1.2 kg o 0 kg
- **THEN** el sistema debe denegar el guardado y retornar una alerta indicando que el peso debe ser mayor a cero

### Requirement: Exclusión de Auditoría Pasiva
La tabla de base de datos de `RegistroPeso` SHALL ser excluida de la inyección de propiedades de sombra de auditoría automática (CreatedBy, CreatedAt, UpdatedAt) según la regla de seguridad del sistema.

#### Scenario: Guardar registro de peso y revisar auditoría
- **WHEN** un usuario guarda un registro de peso
- **THEN** el sistema no debe inyectar valores para propiedades de sombra de auditoría en ese registro
