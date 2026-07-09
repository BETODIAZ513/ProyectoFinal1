## ADDED Requirements

### Requirement: Registro de Hospitalización
El Veterinario o Administrador SHALL poder ingresar una mascota a hospitalización indicando el motivo y asignando un número de jaula único.

#### Scenario: Hospitalizar mascota exitosamente
- **WHEN** el Veterinario ingresa a "Toby" con el motivo "Recuperación post-cirugía" en la jaula "12"
- **THEN** el sistema registra la hospitalización con el estado inicial "Internado"

### Requirement: Validación de Jaula Única
El sistema SHALL validar que no existan dos mascotas internadas simultáneamente en el mismo número de jaula.

#### Scenario: Intentar ingresar mascota en jaula ocupada
- **WHEN** el Veterinario intenta ingresar una mascota en una jaula que ya tiene un paciente "Internado"
- **THEN** el sistema debe rechazar la transacción con un error descriptivo

### Requirement: Alta Médica
El Veterinario o Administrador SHALL poder dar de alta clínica a una mascota internada, registrando la fecha y hora de egreso y cambiando su estado a "Alta".

#### Scenario: Dar de alta clínica
- **WHEN** el Veterinario procesa el alta de una mascota hospitalizada
- **THEN** su estado cambia a "Alta" y se registra la fecha de finalización del internamiento
