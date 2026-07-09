## Context

Se requiere estructurar de manera limpia las pruebas unitarias adicionales en la capa de Aplicación y Dominio para elevar significativamente la cobertura de bloques y líneas de código del reporte de calidad.

## Goals / Non-Goals

**Goals:**
- Implementar cobertura para los comandos y validadores del CRUD de Propietarios.
- Implementar cobertura para la gestión avanzada de Ficha Clínica (Vacunas, Alergias, Medicamentos Activos).
- Implementar cobertura para las Queries (consultas) de lectura de todos los módulos.
- Implementar pruebas en la capa de Dominio para validar constructores y estados iniciales.

**Non-Goals:**
- No implementar pruebas de integración físicas contra base de datos real (SQL Server) en este sprint debido a que aún no se ha integrado un motor físico.

## Decisions

### 1. Organización Interna por Módulos
- **Decisión**: Estructurar los archivos de prueba en clases separadas según su feature (`PropietarioTests.cs`, `FichaClinicaTests.cs`, `QueriesTests.cs` en Application, y `DomainTests.cs` en Domain).
- **Razón**: Mejora la mantenibilidad del código de pruebas al separar la lógica funcional.

### 2. Cobertura de Consultas (Queries)
- **Decisión**: Cargar previamente un conjunto de datos sembrados (fixture) en el DbContext de memoria por cada test de Query, y luego invocar el Handler correspondiente para verificar la lógica de proyecciones y filtros.
- **Razón**: Permite validar que las consultas devuelvan exactamente las colecciones y transformaciones esperadas.

## Risks / Trade-offs

- **[Riesgo] Duplicación de datos de semilla**: Que la preparación de datos por test se vuelva repetitiva.
  - *Mitigación*: Se usarán métodos auxiliares o la base `TestBase` para reutilizar la inicialización de entidades comunes (Mascotas, Veterinarios).
