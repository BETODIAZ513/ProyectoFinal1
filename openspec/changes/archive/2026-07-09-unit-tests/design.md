## Context

Se requiere robustecer el sistema implementando un conjunto completo de pruebas de unidad utilizando MSTest y base de datos en memoria para simular los repositorios y validar las reglas de negocio críticas del backend.

## Goals / Non-Goals

**Goals:**
- Implementar pruebas unitarias para validación de solapamiento de citas médicas.
- Implementar pruebas unitarias para validación de unicidad de jaulas de hospitalización.
- Implementar pruebas unitarias para el registro de bitácora y cierre transaccional de consultas.
- Implementar pruebas de validación de reglas de auditoría pasiva.

**Non-Goals:**
- Pruebas E2E de interfaz de usuario de React con Selenium/Cypress en este Sprint.

## Decisions

### 1. Framework de Pruebas
- **Decisión**: Utilizar MSTest (con atributos `[TestClass]` y `[TestMethod]`).
- **Razón**: Ya se encuentra estructurado en el esqueleto y cuenta con soporte nativo completo de ejecución en .NET 10.

### 2. Persistencia en Memoria para Pruebas
- **Decisión**: Utilizar `Microsoft.EntityFrameworkCore.InMemory` para simular la base de datos de pruebas.
- **Razón**: Permite inicializar contextos de base de datos aislados y rápidos para cada método de prueba, evitando la dependencia de base de datos físicas.

## Risks / Trade-offs

- **[Riesgo] Interferencia entre pruebas**: Que los datos guardados en una prueba afecten a otra.
  - *Mitigación*: Se creará una base de datos en memoria con un nombre único (ej. `Guid.NewGuid().ToString()`) para cada ejecución de test, asegurando aislamiento absoluto.
