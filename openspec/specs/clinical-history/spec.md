# clinical-history Specification

## Purpose
TBD - created by archiving change clinical-records. Update Purpose after archive.
## Requirements
### Requirement: Registro de Detalle Clínico
El Veterinario SHALL poder registrar las notas clínicas de diagnóstico y tratamiento para una mascota al completar su cita médica.

#### Scenario: Registrar diagnóstico y tratamiento válidos al finalizar consulta
- **WHEN** el Veterinario ingresa el diagnóstico "Otitis bilateral" y tratamiento "Limpieza diaria y gotas antibióticas" al completar la cita
- **THEN** el sistema debe almacenar el registro clínico asociado al historial de la mascota

### Requirement: Campos Obligatorios en Consulta
El diagnóstico y el tratamiento SHALL ser campos obligatorios al registrar el detalle clínico de una consulta.

#### Scenario: Intento de registro clínico con campos vacíos
- **WHEN** el Veterinario intenta completar una cita dejando el campo de diagnóstico o tratamiento vacío
- **THEN** el sistema debe impedir el guardado y solicitar el ingreso de los datos requeridos

### Requirement: Consulta de Historial Médico
El personal clínico (Veterinarios, Auxiliares) SHALL poder buscar una mascota y visualizar su expediente clínico completo con los detalles de consultas previas.

#### Scenario: Visualizar historial clínico de una mascota
- **WHEN** el Veterinario abre la ficha clínica de la mascota "Toby"
- **THEN** el sistema debe listar cronológicamente todos los diagnósticos y tratamientos históricos del paciente

