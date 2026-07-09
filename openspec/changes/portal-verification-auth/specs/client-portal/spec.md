## ADDED Requirements

### Requirement: Restricción de Cuenta Pendiente de Verificación
El Portal de Clientes SHALL bloquear el acceso al menú y al historial clínico de las mascotas a cualquier usuario registrado remotamente que no esté verificado (`Activo = false` en `Propietario`), mostrando un aviso destacado informativo de cuenta pendiente.

#### Scenario: Visualizar aviso de cuenta pendiente de verificación
- **WHEN** un propietario registrado de forma remota inicia sesión en el portal y su cuenta aún no ha sido verificada
- **THEN** el portal móvil muestra una pantalla informativa bloqueando el acceso al dashboard de mascotas y deshabilitando todas las opciones de navegación
