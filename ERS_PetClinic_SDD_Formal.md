# Especificación de Requisitos de Software (ERS)
**PetClinic Management System**
**Metodología:** SDD (Spec-Driven Development)

## 0. Control de Versiones
| Versión | Fecha      | Autor               | Descripción del cambio |
|---------|------------|---------------------|------------------------|
| 2.0.0   | 2026-06-08 | SDD SpecWriter      | Versión inicial de la ERS bajo marco SDD a partir de documento base. |
| 2.0.1   | 2026-06-08 | SDD SpecWriter      | [PATCH] Resolución de ambigüedad en REQ-TAR-07. |
| 2.1.0   | 2026-06-08 | SDD SpecWriter      | Completar cobertura total de requisitos y BDD |
| 2.2.0   | 2026-06-09 | SDD SpecWriter      | [MINOR] Refactorización arquitectónica UI a "Clinical Precision", restricción estricta de navegación por rol (REQ-NAV-01/02), rediseño de formularios (Citas, Propietarios, Mascotas) e inclusión de acciones rápidas (Edición y Añadir Mascota) en listados. |
| 2.2.1   | 2026-06-09 | SDD SpecWriter      | [PATCH] Acoplamiento a BD SQL Server pre-existente: resolución de conflictos de Data Seeding, mapeo de Enum `EstadoMascota` vs CHECK constraints, y flexibilización de Login (Email/UserName). Preparación de suite de Pruebas de Integración (Modo C2). |

## 1. Introducción
### 1.1 Propósito
Este documento define la especificación técnica, las reglas de negocio y los criterios de aceptación del sistema PetClinic Management System bajo la metodología de Desarrollo Guiado por Especificaciones (SDD). Es la Única Fuente de Verdad (SSoT) del proyecto.

### 1.2 Alcance del Sistema
Aplicación web interna de gestión para una clínica veterinaria. Permite administrar propietarios, mascotas, citas, historial clínico, tareas clínicas y personal. El acceso es exclusivo para usuarios internos.

### 1.3 Actores del Sistema
- **Administrador**: Control total. Gestiona usuarios, propietarios, mascotas, citas, tareas y catálogos.
- **Veterinario**: Acceso clínico. Gestiona diagnósticos, notas, tareas clínicas y ve sus citas asignadas.
- **Auxiliar Clínico**: Acceso operativo. Gestiona tareas de pacientes hospitalizados.
- **Recepcionista**: Acceso operativo. Confirma llegadas y salidas de pacientes con cita.

### 1.4 Stack Tecnológico
- Framework Web: ASP.NET Core MVC (.NET 10)
- ORM: Entity Framework Core 10
- Base de Datos: SQL Server
- Autenticación: ASP.NET Core Identity + RBAC
- Pruebas: MSTest + Moq + EF Core InMemory

## 2. Codificación Jerárquica de Requisitos
| Código     | Módulo                       | Categoría                              |
|------------|------------------------------|----------------------------------------|
| REQ-SEG-XX | Módulo 1: Seguridad y Acceso | Autenticación, Roles y Auditoría       |
| REQ-NAV-XX | Módulo 2: Interfaz y Nav.    | UI, Menú y Dashboard                   |
| REQ-PRO-XX | Módulo 3: Propietarios       | Gestión de Clientes                    |
| REQ-MAS-XX | Módulo 4: Mascotas           | Gestión de Pacientes y Ficha Clínica   |
| REQ-CIT-XX | Módulo 5: Citas              | Agenda y Lógica de Negocio             |
| REQ-HIS-XX | Módulo 6: Historial          | Historial de Citas e Historial Clínico |
| REQ-TAR-XX | Módulo 7: Tareas Clínicas    | Operativo Auxiliar y Veterinario       |
| REQ-VET-XX | Módulo 8: Veterinarios       | Gestión de Personal con Acceso         |

## 3. Especificaciones por Módulo

### Módulo 1: Seguridad y Control de Acceso

```text
[REQ-SEG-01] Autenticación Obligatoria y Barrera de Acceso
─────────────────────────────────────────
Descripción   : El sistema DEBE exigir autenticación mediante usuario y contraseña para acceder a cualquier funcionalidad.
Comportamiento: Cualquier acceso no autenticado a rutas protegidas DEBE ser rechazado y redirigido a /Login.
Restricciones : NO DEBE existir auto-registro ni recuperación de contraseña pública. Las cuentas son creadas exclusivamente por el Administrador.
Actor(es)     : Sistema / Todos los roles
Prioridad     : Alta
Estado        : Aprobado
```

```text
[REQ-SEG-02] Gestión de Sesión y Cierre de Sesión
─────────────────────────────────────────
Descripción   : El sistema DEBE proveer un control de cierre de sesión accesible desde el menú superior.
Comportamiento: Al ejecutarse el logout, el sistema DEBE invalidar inmediatamente la cookie o token de sesión y redirigir a /Login.
Restricciones : N/A.
Actor(es)     : Todos los roles
Prioridad     : Alta
Estado        : Aprobado
```

```text
[REQ-SEG-03] Auditoría Transaccional Pasiva (Shadow Properties)
─────────────────────────────────────────
Descripción   : El sistema DEBE persistir una huella de auditoría invisible en cada inserción o modificación.
Comportamiento: El motor DEBE interceptar SaveChanges y escribir: CreatedBy, CreatedAt (UTC) y UpdatedAt (UTC).
Restricciones : CreatedBy y CreatedAt NO DEBEN ser alterados en actualizaciones.
Validaciones  : Aplica a todas las entidades excepto TareasPredefinidas y RegistroPeso.
Actor(es)     : Sistema
Prioridad     : Alta
Estado        : Aprobado
```

```text
[REQ-SEG-04] Control de Acceso Basado en Roles (RBAC)
─────────────────────────────────────────
Descripción   : El sistema DEBE distinguir permisos entre Administrador, Veterinario, AuxiliarClinico y Recepcionista.
Comportamiento: Las rutas protegidas por rol DEBEN retornar HTTP 403 y redirigir a /Inicio si el rol no tiene permiso.
Restricciones : N/A.
Actor(es)     : Sistema
Prioridad     : Alta
Estado        : Aprobado
```

```text
[REQ-SEG-05] Creación de Cuentas de Usuarios
─────────────────────────────────────────
Descripción   : El Administrador DEBE poder crear, editar y desactivar cuentas de Veterinarios y Auxiliares.
Comportamiento: Al crear una cuenta, el sistema DEBE asignar automáticamente el rol correspondiente.
Restricciones : NO DEBE exponerse ningún formulario de registro público bajo ninguna circunstancia.
Actor(es)     : Administrador
Prioridad     : Alta
Estado        : Aprobado
```

### Módulo 2: Interfaz y Navegación

```text
[REQ-NAV-01] Menú de Navegación (Ribbon Menu) Restringido por Rol
─────────────────────────────────────────
Descripción   : El sistema DEBE renderizar un menú tipo cinta persistente en la cabecera adaptado al diseño "Clinical Precision".
Comportamiento: El menú DEBE mostrar ESTRICTAMENTE los ítems correspondientes al rol autenticado según el prototipo UI:
                - Administrador: Inicio, Propietarios, Mascotas, Citas, Historial.
                - Recepcionista: Inicio, Recepción.
                - Veterinario: Inicio, Consultas, Historial Clínico.
                - Auxiliar Clínico: Inicio, Tareas Médicas, Hospitalización.
Restricciones : Ningún rol PUEDE visualizar enlaces de otros roles, garantizando el aislamiento visual de módulos.
Actor(es)     : Todos los roles
Prioridad     : Alta
Estado        : Aprobado
```

```text
[REQ-NAV-02] Dashboards de Inicio Dinámicos por Rol
─────────────────────────────────────────
Descripción   : La pantalla /Inicio DEBE cargar dinámicamente un dashboard específico según el rol del usuario autenticado bajo el diseño "Clinical Precision".
Comportamiento: 
- Admin: Métricas globales, citas de la semana, listado de próximas citas.
- Recepcionista: Control de llegadas, pacientes en sala de espera, agenda del día.
- Veterinario: Resumen de sus consultas particulares del día y semana.
- Aux. Clínico: Monitor de pacientes hospitalizados y lista de tareas médicas con prioridad.
Actor(es)     : Todos los roles
Prioridad     : Alta
Estado        : Aprobado
```

### Módulo 3: Propietarios

```text
[REQ-PRO-01] Operaciones CRUD de Propietarios
─────────────────────────────────────────
Descripción   : El Administrador DEBE poder crear, consultar, editar y desactivar registros de propietarios.
Comportamiento: El registro DEBE validar campos obligatorios (Nombre, Telefono, Correo, Direccion).
Restricciones : Los propietarios NO DEBEN eliminarse físicamente. Se desactivan (campo Activo = false).
Validaciones  : Correo único. Telefono numérico. Nombre mín 3 caracteres.
Actor(es)     : Administrador
Prioridad     : Alta
Estado        : Aprobado
```

```text
[REQ-PRO-02] Listado Paginado con Búsqueda
─────────────────────────────────────────
Descripción   : La vista de listado DEBE presentar propietarios paginados con búsqueda y ordenamiento.
Comportamiento: Búsqueda por nombre, teléfono o correo electrónico. Ordenamiento por nombre y fecha de registro.
Actor(es)     : Administrador
Prioridad     : Media
Estado        : Aprobado
```

```text
[REQ-PRO-03] Vista de Detalle del Propietario
─────────────────────────────────────────
Descripción   : Desde la ficha de un propietario, el Admin DEBE ver el listado completo de mascotas asociadas con su estado actual.
Comportamiento: Cada mascota listada DEBE mostrar: nombre, especie, raza y estado actual.
Actor(es)     : Administrador
Prioridad     : Alta
Estado        : Aprobado
```

```text
[REQ-PRO-04] Añadir Mascota desde Perfil del Propietario
─────────────────────────────────────────
Descripción   : La vista de detalle del propietario DEBE incluir un botón "Añadir Mascota".
Comportamiento: El campo Propietario DEBE estar pre-cargado con el propietario actual y NO ser editable en ese contexto.
Actor(es)     : Administrador
Prioridad     : Media
Estado        : Aprobado
```

### Módulo 4: Mascotas

```text
[REQ-MAS-01] Operaciones CRUD de Mascotas
─────────────────────────────────────────
Descripción   : El Administrador DEBE poder crear, consultar, editar y gestionar el estado de mascotas.
Comportamiento: Requiere vincular a un propietario válido y activo.
Restricciones : Las mascotas NO SE ELIMINAN. Estado Fallecida conserva el historial.
Validaciones  : FechaNacimiento no puede ser futura. Peso numérico positivo.
Actor(es)     : Administrador
Prioridad     : Alta
Estado        : Aprobado
```

```text
[REQ-MAS-02] Listado Paginado con Búsqueda
─────────────────────────────────────────
Descripción   : La vista de listado DEBE presentar mascotas paginadas con búsqueda por nombre, especie, raza y propietario.
Comportamiento: Visualización en formato de grilla de datos navegable.
Actor(es)     : Administrador
Prioridad     : Media
Estado        : Aprobado
```

```text
[REQ-MAS-03] Máquina de Estados de la Mascota
─────────────────────────────────────────
Descripción   : Cada mascota DEBE tener un estado clínico que refleje su situación actual.
Comportamiento: El estado inicial DEBE ser ConPropietario asignado automáticamente.
Restricciones : El estado Fallecida bloquea la creación de nuevas citas.
Actor(es)     : Administrador
Prioridad     : Alta
Estado        : Aprobado
```

```text
[REQ-MAS-04] Ficha Clínica de la Mascota
─────────────────────────────────────────
Descripción   : La mascota DEBE tener una ficha clínica dividida en 4 sub-módulos.
Comportamiento: 
- 04a Vacunas: Registro de dosis aplicadas. El sistema DEBE alertar visualmente 30 días antes del vencimiento.
- 04b Historial de Peso: Registro cronológico y gráfica de evolución.
- 04c Alergias: Registro de condiciones crónicas. DEBE mostrarse como advertencia al crear citas.
- 04d Medicamentos: Registro de dosis. DEBE marcarse inactivo al superar fecha estimada de fin.
Actor(es)     : Administrador, Veterinario
Prioridad     : Alta
Estado        : Aprobado
```

### Módulo 5: Citas Médicas

```text
[REQ-CIT-01] Dependencia de Agendamiento
─────────────────────────────────────────
Descripción   : El sistema DEBE restringir la creación de citas a la selección obligatoria de una Mascota y un Veterinario activos.
Comportamiento: El formulario DEBE usar controles relacionales de selección.
Restricciones : NO SE PUEDE agendar cita para una mascota con estado Fallecida.
Actor(es)     : Administrador
Prioridad     : Alta
Estado        : Aprobado
```

```text
[REQ-CIT-02] Prevención de Solapamiento de Horarios
─────────────────────────────────────────
Descripción   : El sistema NO DEBE permitir registrar o modificar una cita si el Veterinario tiene otra cita activa que se cruce en tiempo.
Comportamiento: En caso de solapamiento: abortar transacción, rechazar operación y mostrar error descriptivo.
Actor(es)     : Sistema
Prioridad     : Alta
Estado        : Aprobado
```

```text
[REQ-CIT-03] Estado Inicial y Ciclo de Vida de la Cita
─────────────────────────────────────────
Descripción   : Toda cita registrada exitosamente DEBE persistirse con estado Programada.
Comportamiento: El Admin o Veterinario PUEDE cambiar el estado de Programada a Completada o Cancelada.
Restricciones : Los estados Completada y Cancelada son terminales: NO SE PUEDEN modificar una vez alcanzados.
Actor(es)     : Administrador, Veterinario
Prioridad     : Alta
Estado        : Aprobado
```

```text
[REQ-CIT-04] Botón Prominente "Añadir Cita"
─────────────────────────────────────────
Descripción   : La interfaz del módulo de Citas DEBE presentar un botón principal "Añadir Cita".
Comportamiento: Al hacer clic, el sistema DEBE mostrar el formulario modal de agendamiento.
Restricciones : El botón NO DEBE ser visible para el Veterinario.
Actor(es)     : Administrador
Prioridad     : Media
Estado        : Aprobado
```

```text
[REQ-CIT-05] Visualización Dual Dinámica
─────────────────────────────────────────
Descripción   : El módulo DEBE ofrecer dos modos de visualización (Lista y Cuadrícula) con alternancia dinámica sin recarga.
Comportamiento: Vista Lista es cronológica. Vista Cuadrícula es un calendario semanal interactivo. El veterinario solo ve sus propias citas.
Actor(es)     : Administrador, Veterinario
Prioridad     : Alta
Estado        : Aprobado
```

```text
[REQ-CIT-06] Campos del Formulario de Cita
─────────────────────────────────────────
Descripción   : El formulario DEBE exigir Mascota, Veterinario, Fecha, HoraInicio, HoraFin, MotivoConsulta.
Comportamiento: Las notas adicionales son opcionales. Estado, CreatedBy y CreatedAt se calculan automáticamente.
Actor(es)     : Administrador
Prioridad     : Alta
Estado        : Aprobado
```

### Módulo 6: Historial

```text
[REQ-HIS-01] Historial Global de Citas Pasadas
─────────────────────────────────────────
Descripción   : La sección /Historial DEBE mostrar todas las citas con estado Completada o Cancelada.
Comportamiento: La vista DEBE ser paginada y filtrable por fecha, mascota, veterinario y estado.
Restricciones : El veterinario solo ve sus propias citas históricas.
Actor(es)     : Administrador, Veterinario
Prioridad     : Alta
Estado        : Aprobado
```

```text
[REQ-HIS-02] Historial Clínico por Mascota
─────────────────────────────────────────
Descripción   : Desde el perfil de mascota, el sistema DEBE mostrar su ficha clínica longitudinal completa.
Comportamiento: Incluye fecha, veterinario, motivo, diagnóstico, notas clínicas, tratamientos y medicamentos recetados.
Actor(es)     : Administrador, Veterinario
Prioridad     : Alta
Estado        : Aprobado
```

```text
[REQ-HIS-03] Registro de Diagnóstico y Notas Clínicas
─────────────────────────────────────────
Descripción   : El Admin y el Veterinario DEBEN poder registrar y editar el diagnóstico y notas clínicas de una cita.
Comportamiento: Los campos DEBEN habilitarse únicamente cuando la cita tiene estado Completada. Cada modificación DEBE auditarse con UpdatedAt.
Actor(es)     : Administrador, Veterinario
Prioridad     : Alta
Estado        : Aprobado
```

### Módulo 7: Tareas Clínicas

```text
[REQ-TAR-01] Catálogo de Tareas Predefinidas
─────────────────────────────────────────
Descripción   : El sistema DEBE mantener un catálogo de tareas comunes gestionado exclusivamente por el Administrador.
Comportamiento: Permite agregar, editar y desactivar tareas estándar (Alimentacion, Medicamento, Radiografia, etc).
Actor(es)     : Administrador
Prioridad     : Alta
Estado        : Aprobado
```

```text
[REQ-TAR-02] Creación de Tareas Clínicas
─────────────────────────────────────────
Descripción   : El Admin y el Veterinario DEBEN poder crear tareas clínicas para una mascota.
Comportamiento: Pueden elegir del catálogo o crear una personalizada de texto libre. PUEDEN asignar a un auxiliar específico o dejarla libre.
Actor(es)     : Administrador, Veterinario
Prioridad     : Alta
Estado        : Aprobado
```

```text
[REQ-TAR-03] Edición y Cancelación de Tareas
─────────────────────────────────────────
Descripción   : Tareas Pendientes o EnProceso PUEDEN ser editadas o canceladas.
Comportamiento: El veterinario PUEDE cancelar las que él mismo creó. El Admin PUEDE eliminar tareas Pendientes no tomadas.
Restricciones : Tareas Completadas NO PUEDEN modificarse.
Actor(es)     : Administrador, Veterinario
Prioridad     : Media
Estado        : Aprobado
```

```text
[REQ-TAR-04] Vista de Tareas por Cargo de Auxiliar
─────────────────────────────────────────
Descripción   : La vista de tareas DEBE filtrarse automáticamente según el cargo del auxiliar.
Comportamiento: Aux. Clínico ve pacientes hospitalizados o en cirugía. Recepcionista ve llegada/salida de citas. Ambos ven bandeja libre.
Actor(es)     : Auxiliar Clínico, Recepcionista
Prioridad     : Alta
Estado        : Aprobado
```

```text
[REQ-TAR-05] Completar Tarea y Registro de Trazabilidad
─────────────────────────────────────────
Descripción   : Al marcar una tarea como completada, el sistema DEBE registrar la auditoría de ejecución.
Comportamiento: El sistema DEBE guardar CompletadaPor (usuario) y FechaHoraCompletada (UTC).
Actor(es)     : Administrador, Veterinario, Auxiliar Clínico, Recepcionista
Prioridad     : Alta
Estado        : Aprobado
```

```text
[REQ-TAR-06] Historial de Tareas para el Administrador
─────────────────────────────────────────
Descripción   : El Admin DEBE tener una vista del historial de tareas completadas.
Comportamiento: Incluye filtros por rango de fechas, tipo de tarea, quién la completó y mascota.
Actor(es)     : Administrador
Prioridad     : Media
Estado        : Aprobado
```

```text
[REQ-TAR-07] Gestión Inmutable de Registro de Llegada/Salida
─────────────────────────────────────────
Descripción   : El sistema DEBE registrar la llegada y salida física del paciente en la clínica.
Comportamiento: El registro de llegada o salida PUEDE ser marcado por CUALQUIER personal autenticado en el sistema.
Restricciones : El registro de llegada y salida es estrictamente INMUTABLE. NO DEBE ser modificado ni alterado históricamente.
Actor(es)     : Todos los roles
Prioridad     : Alta
Estado        : Aprobado
```

### Módulo 8: Veterinarios

```text
[REQ-VET-01] CRUD de Veterinarios
─────────────────────────────────────────
Descripción   : El Administrador DEBE poder crear, editar y desactivar perfiles de veterinarios.
Comportamiento: Al crear el perfil, se DEBE crear simultáneamente la cuenta de acceso al sistema.
Restricciones : Un veterinario inactivo NO DEBE aparecer en los selectores de agendamiento de nuevas citas.
Actor(es)     : Administrador
Prioridad     : Alta
Estado        : Aprobado
```

## 4. Criterios de Aceptación BDD (Gherkin)

### Módulo 1 y 2
```gherkin
Escenario: Renderizado condicional del Ribbon Menu (REQ-NAV-01) (Camino Feliz)
  Dado que un Auxiliar Clínico ha iniciado sesión
  Cuando renderiza la cabecera superior
  Entonces el sistema DEBE mostrar los botones "Inicio", "Hospitalización" y "Cerrar Sesión"
  Y NO DEBE mostrar los botones "Propietarios" o "Mascotas"

Escenario: Intento de acceso a ruta prohibida por Ribbon (REQ-NAV-01) (Error)
  Dado que un Recepcionista ha iniciado sesión
  Cuando intenta navegar forzadamente a la URL "/Propietarios"
  Entonces el sistema DEBE denegar el acceso
  Y DEBE redirigir al usuario al dashboard
```

### Módulo 3 y 4
```gherkin
Escenario: Creación exitosa de propietario y su mascota (REQ-PRO-04, REQ-MAS-01) (Camino Feliz)
  Dado que el Administrador está en la ficha del propietario activo "Juan Pérez"
  Cuando hace clic en "Añadir Mascota", rellena los datos de "Toby" y guarda
  Entonces el sistema DEBE persistir la mascota
  Y DEBE mostrar a "Toby" listado en la vista de detalle de "Juan Pérez" con estado "ConPropietario"

Escenario: Bloqueo de creación de mascota por peso inválido (REQ-MAS-01) (Error)
  Dado que el Administrador está en el formulario de creación de mascota
  Cuando ingresa el peso inicial de "-2.5" kg y guarda
  Entonces el sistema DEBE rechazar la transacción
  Y DEBE mostrar una alerta de validación requiriendo un peso positivo

Escenario: Registro y alerta de alergia crítica (REQ-MAS-04) (Camino Feliz)
  Dado que la mascota "Luna" tiene una AlergiaCondicion activa por "Penicilina"
  Cuando el Administrador intenta abrir el formulario de agendamiento para "Luna"
  Entonces el sistema DEBE mostrar una advertencia visible en rojo sobre la alergia
  Y DEBE permitir continuar el proceso

Escenario: Expiración automática de medicamento (REQ-MAS-04) (Error/Borde)
  Dado que la mascota "Rex" tiene un MedicamentoActivo cuya fecha estimada de fin fue hace 2 días
  Cuando el sistema renderiza la ficha clínica en el sub-módulo de Medicamentos
  Entonces el sistema DEBE mostrar el medicamento como inactivo automáticamente
```

### Módulo 5 y 6
```gherkin
Escenario: Creación de cita sin solapamiento (REQ-CIT-01) (Camino Feliz)
  Dado que el "Dr. Pérez" está activo y no tiene citas en la mañana
  Cuando el Administrador agenda una cita para la mascota "Toby" el "2026-05-28 de 09:00 a 10:00"
  Entonces el sistema DEBE aprobar y persistir la cita
  Y DEBE reflejarse en la vista Cuadrícula del Dr. Pérez (REQ-CIT-05)

Escenario: Bloqueo de agendamiento sin seleccionar mascota (REQ-CIT-01) (Error)
  Dado que el Administrador está en el formulario de Cita (REQ-CIT-04)
  Cuando intenta guardar sin seleccionar una Mascota de la base de datos relacional
  Entonces el sistema DEBE bloquear el guardado y mostrar el campo como obligatorio

Escenario: Acceso al historial clínico y notas de cita (REQ-HIS-01, REQ-HIS-03) (Camino Feliz)
  Dado que la cita de "Toby" con el "Dr. Pérez" ha transicionado a estado "Completada"
  Cuando el "Dr. Pérez" ingresa a la cita desde el Historial
  Entonces el sistema DEBE habilitar la edición de "Diagnóstico" y "Notas Clínicas"
  Y DEBE registrar el UpdatedAt al guardar

Escenario: Intento de edición de diagnóstico en cita programada (REQ-HIS-03) (Error)
  Dado que una cita está en estado "Programada"
  Cuando un Veterinario visualiza los detalles de la consulta
  Entonces el sistema NO DEBE permitir editar los campos de Diagnóstico y Notas
```

### Módulo 7 y 8
```gherkin
Escenario: Catálogo de Tareas actualizado por Admin (REQ-TAR-01) (Camino Feliz)
  Dado que el Administrador está en el catálogo de tareas predefinidas
  Cuando añade una tarea "Profilaxis Dental" y la activa
  Entonces la tarea DEBE estar disponible en el selector de creación para Veterinarios

Escenario: Intento de creación de tarea predefinida por Veterinario (REQ-TAR-01) (Error)
  Dado que un Veterinario ha iniciado sesión
  Cuando navega al catálogo general de tareas predefinidas
  Entonces el sistema DEBE denegar el acceso por falta de permisos (RBAC)

Escenario: Asignación y ejecución de tarea clínica libre (REQ-TAR-02, REQ-TAR-05) (Camino Feliz)
  Dado que existe una tarea de "Radiografía" en estado "Pendiente" y sin asignación
  Cuando el Auxiliar Clínico "aux_01" hace clic en tomar tarea y luego en "Marcar como Completada"
  Entonces el sistema DEBE registrar CompletadaPor = "aux_01"
  Y DEBE registrar la fecha y hora UTC exacta del evento

Escenario: Creación de veterinario inactivo (REQ-VET-01) (Error/Borde)
  Dado que el Administrador ha creado un Veterinario "Dr. Silva" con estado "Inactivo"
  Cuando se despliega el selector de veterinarios en el formulario de citas
  Entonces "Dr. Silva" NO DEBE aparecer como una opción seleccionable
```

## 5. Modelo Lógico de Datos

### 5.1 Entidades
| Entidad | Campos Principales | Auditoría |
|---------|-------------------|-----------|
| ApplicationUser | Id, NombreCompleto, Rol | No |
| Veterinario | Id, NombreCompleto, Especialidad, NumeroColegiatura, Telefono, CorreoElectronico, Estado, ApplicationUserId (FK) | Sí |
| Auxiliar | Id, NombreCompleto, Cargo, Telefono, CorreoElectronico, Estado, ApplicationUserId (FK) | Sí |
| Propietario | Id, NombreCompleto, Telefono, CorreoElectronico, Direccion, Activo | Sí |
| Mascota | Id, Nombre, Especie, Raza, FechaNacimiento, Sexo, PesoInicial, Estado, PropietarioId (FK) | Sí |
| Cita | Id, FechaHoraInicio, FechaHoraFin, MotivoConsulta, Diagnostico, NotasClinicas, Tratamiento, Estado, MascotaId (FK), VeterinarioId (FK) | Sí |
| Vacuna | Id, Nombre, FechaAplicacion, FechaProximaDosis, Observaciones, MascotaId (FK), VeterinarioId (FK) | Sí |
| RegistroPeso | Id, Peso, FechaMedicion, MascotaId (FK) | No |
| AlergiaCondicion | Id, Descripcion, FechaDiagnostico, Estado, MascotaId (FK) | Sí |
| MedicamentoActivo| Id, NombreMedicamento, Dosis, Frecuencia, FechaInicio, FechaEstimadaFin, EstaActivo, MascotaId (FK), VeterinarioId (FK) | Sí |
| TareasPredefinidas| Id, Nombre, Descripcion, Activo | No |
| TareaClinica | Id, Tipo, Descripcion, EsPredefinida, Estado, FechaHoraCreacion, FechaHoraCompletada, CreadaPor (FK), AsignadoA (FK), CompletadaPor (FK), MascotaId (FK) | Sí |
| RegistroLlegada | Id, FechaHoraLlegada, FechaHoraSalida, CitaId (FK), AuxiliarId (FK) | Sí |

### 5.2 Tablas en Base de Datos (19 Tablas)
| # | Tabla | Origen |
|---|-------|--------|
| 1 | AspNetUsers | ASP.NET Core Identity |
| 2 | AspNetRoles | ASP.NET Core Identity |
| 3 | AspNetUserRoles | ASP.NET Core Identity |
| 4 | AspNetUserClaims | ASP.NET Core Identity |
| 5 | AspNetRoleClaims | ASP.NET Core Identity |
| 6 | AspNetUserLogins | ASP.NET Core Identity |
| 7 | AspNetUserTokens | ASP.NET Core Identity |
| 8 | Veterinarios | Dominio propio |
| 9 | Auxiliares | Dominio propio |
| 10 | Propietarios | Dominio propio |
| 11 | Mascotas | Dominio propio |
| 12 | Citas | Dominio propio |
| 13 | Vacunas | Ficha clínica |
| 14 | RegistrosPeso | Ficha clínica |
| 15 | AlergiasCondiciones | Ficha clínica |
| 16 | MedicamentosActivos | Ficha clínica |
| 17 | TareasPredefinidas | Operativo |
| 18 | TareasClinicas | Operativo |
| 19 | RegistrosLlegada | Operativo |

### 5.3 Relaciones
| Entidad Origen | Cardinalidad | Entidad Destino |
|----------------|-------------|-----------------|
| ApplicationUser | 1 : 1 | Veterinario |
| ApplicationUser | 1 : 1 | Auxiliar |
| ApplicationUser | 1 : N | TareaClinica (CreadaPor) |
| ApplicationUser | 1 : N | TareaClinica (AsignadoA) |
| ApplicationUser | 1 : N | TareaClinica (CompletadaPor) |
| Propietario | 1 : N | Mascota |
| Mascota | 1 : N | Cita |
| Mascota | 1 : N | Vacuna |
| Mascota | 1 : N | RegistroPeso |
| Mascota | 1 : N | AlergiaCondicion |
| Mascota | 1 : N | MedicamentoActivo |
| Mascota | 1 : N | TareaClinica |
| Veterinario | 1 : N | Cita |
| Veterinario | 1 : N | Vacuna |
| Veterinario | 1 : N | MedicamentoActivo |
| Cita | 1 : 1 | RegistroLlegada |
| Auxiliar | 1 : N | RegistroLlegada |

## 6. Resumen de Requisitos
| Código     | Requisito | Prioridad | Actor Responsable |
|------------|-----------|-----------|-------------------|
| REQ-SEG-01 | Autenticación y Barrera de Acceso | Alta | Todos los roles |
| REQ-SEG-02 | Gestión de Sesión y Cierre | Alta | Todos los roles |
| REQ-SEG-03 | Auditoría pasiva (Shadow properties) | Alta | Sistema |
| REQ-SEG-04 | RBAC (Control por roles) | Alta | Sistema |
| REQ-SEG-05 | Creación de cuentas de usuarios | Alta | Administrador |
| REQ-NAV-01 | Menú de Navegación (Ribbon Menu) | Alta | Todos los roles |
| REQ-NAV-02 | Dashboard de Inicio | Media | Todos los roles |
| REQ-PRO-01 | Operaciones CRUD de Propietarios | Alta | Administrador |
| REQ-PRO-02 | Listado Paginado con Búsqueda | Media | Administrador |
| REQ-PRO-03 | Vista de Detalle del Propietario | Alta | Administrador |
| REQ-PRO-04 | Añadir Mascota desde Perfil | Media | Administrador |
| REQ-MAS-01 | Operaciones CRUD de Mascotas | Alta | Administrador |
| REQ-MAS-02 | Listado Paginado con Búsqueda | Media | Administrador |
| REQ-MAS-03 | Máquina de Estados de la Mascota | Alta | Administrador |
| REQ-MAS-04 | Ficha Clínica de la Mascota | Alta | Admin, Veterinario |
| REQ-CIT-01 | Dependencia de Agendamiento | Alta | Administrador |
| REQ-CIT-02 | Prevención de solapamiento | Alta | Sistema |
| REQ-CIT-03 | Estado Inicial y Ciclo de Vida | Alta | Admin, Veterinario |
| REQ-CIT-04 | Botón Prominente "Añadir Cita" | Media | Administrador |
| REQ-CIT-05 | Visualización Dual Dinámica | Alta | Admin, Veterinario |
| REQ-CIT-06 | Campos del Formulario de Cita | Alta | Administrador |
| REQ-HIS-01 | Historial Global de Citas Pasadas | Alta | Admin, Veterinario |
| REQ-HIS-02 | Historial Clínico por Mascota | Alta | Admin, Veterinario |
| REQ-HIS-03 | Registro de Diagnóstico y Notas | Alta | Admin, Veterinario |
| REQ-TAR-01 | Catálogo de Tareas Predefinidas | Alta | Administrador |
| REQ-TAR-02 | Creación de Tareas Clínicas | Alta | Admin, Veterinario |
| REQ-TAR-03 | Edición y Cancelación de Tareas | Media | Admin, Veterinario |
| REQ-TAR-04 | Vista de Tareas por Cargo | Alta | Auxiliar, Recepcionista |
| REQ-TAR-05 | Completar Tarea y Trazabilidad | Alta | Todos los roles |
| REQ-TAR-06 | Historial de Tareas | Media | Administrador |
| REQ-TAR-07 | Gestión Inmutable de Llegada/Salida | Alta | Todos los roles |
| REQ-VET-01 | CRUD de Veterinarios | Alta | Administrador |
