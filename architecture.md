# Arquitectura del Sistema - PetClinic Management System

Este documento describe la arquitectura global del sistema PetClinic Management System. Es un documento vivo que se actualiza al final de cada Sprint (archive) para documentar el diseño total de todo el proyecto.

---

## 1. Diseño Arquitectónico Global

El sistema está estructurado bajo el patrón de **Arquitectura Limpia (Clean Architecture)** en el backend, desacoplado completamente de la capa cliente mediante un desarrollo de **Single Page Application (SPA)** en el frontend.

```mermaid
graph TD
    %% Frontend Layer
    subgraph Capa Cliente (SPA)
        Web[PetClinic.Web - React + TS]
    end

    %% Backend Layers
    subgraph Capa de Presentación Backend
        Api[PetClinic.Api - Web API]
    end

    subgraph Capa de Infraestructura
        Infra[PetClinic.Infrastructure - EF Core + SQL Server]
    end

    subgraph Capa de Aplicación
        App[PetClinic.Application - CQRS / MediatR]
    end

    subgraph Capa de Dominio (Núcleo)
        Dom[PetClinic.Domain - Entidades y Enums]
    end

    %% Dependencies
    Web -- Peticiones HTTP / JSON --> Api
    Api --> Infra
    Api --> App
    Infra --> App
    Infra --> Dom
    App --> Dom

    classDef core fill:#d4edda,stroke:#28a745,stroke-width:2px;
    classDef application fill:#cce5ff,stroke:#007bff,stroke-width:2px;
    classDef infra fill:#fff3cd,stroke:#ffc107,stroke-width:2px;
    classDef presentation fill:#f8d7da,stroke:#dc3545,stroke-width:2px;
    classDef client fill:#e2e3e5,stroke:#383d41,stroke-width:2px;

    class Dom core;
    class App application;
    class Infra infra;
    class Api presentation;
    class Web client;
```

---

## 2. Responsabilidad de las Capas

### 2.1 `PetClinic.Domain` (Capa de Dominio)
* **Responsabilidad**: Es el núcleo de la aplicación. Contiene las entidades del dominio de negocio, enums, value objects, excepciones de dominio y reglas de negocio puras.
* **Dependencias**: Cero dependencias externas o de otras capas. No depende de base de datos ni de frameworks de terceros (excepto librerías básicas del lenguaje).

### 2.2 `PetClinic.Application` (Capa de Aplicación)
* **Responsabilidad**: Define los casos de uso del sistema. Implementa el patrón CQRS (Command Query Responsibility Segregation) usando **MediatR** y se encarga de las validaciones de entrada mediante **FluentValidation**. Contiene las interfaces que implementa la infraestructura (como repositorios e interfaces de servicios).
* **Dependencias**: Depende únicamente de `PetClinic.Domain`.

### 2.3 `PetClinic.Infrastructure` (Capa de Infraestructura)
* **Responsabilidad**: Contiene los detalles tecnológicos del sistema. Implementa la persistencia de datos con **Entity Framework Core 10** mapeado a **SQL Server**, repositorios concretos, migraciones de base de datos y la autenticación mediante **ASP.NET Core Identity**.
* **Dependencias**: Depende de `PetClinic.Application` (para implementar sus contratos) y `PetClinic.Domain`.

### 2.4 `PetClinic.Api` (Capa de Presentación Backend)
* **Responsabilidad**: Punto de entrada del backend. Contiene los controladores REST (HTTP Controllers), configuración de inyección de dependencias global, políticas de seguridad y CORS, y la documentación de la API (Swagger/OpenAPI).
* **Dependencias**: Depende de `PetClinic.Infrastructure` y `PetClinic.Application`.

### 2.5 `PetClinic.Web` (Capa Cliente SPA)
* **Responsabilidad**: Aplicación web de página única (SPA) cliente construida con **React, TypeScript y Vite**. Consume la API expuesta por el backend de manera asíncrona mediante peticiones HTTP.
* **Dependencias**: Desacoplada físicamente del servidor backend.

---

## 3. Flujo de Control de una Petición

Cuando se ejecuta una acción en el sistema (por ejemplo, registrar una Mascota):

1. **Cliente (`PetClinic.Web`)**: Realiza un `POST /api/mascotas` enviando datos en formato JSON.
2. **Controlador (`PetClinic.Api`)**: Recibe la petición, mapea el JSON a un objeto Command y lo envía al mediador (`IMediator.Send()`).
3. **Manejador (`PetClinic.Application`)**: MediatR despacha el Command a su correspondiente Handler. El Handler valida los datos (usando FluentValidation), recupera entidades necesarias mediante contratos de repositorio (`IPetClinicDbContext` o `IRepository`), y delega la ejecución de lógica de negocio al Dominio.
4. **Dominio (`PetClinic.Domain`)**: Las entidades ejecutan sus métodos de negocio (ej. transicionar estado) y garantizan las invariantes de negocio.
5. **Persistencia (`PetClinic.Infrastructure`)**: El manejador de la aplicación llama a `SaveChanges()` en el DbContext. La infraestructura persiste los cambios en la base de datos SQL Server y aplica Shadow Properties para auditoría (CreatedBy, CreatedAt, UpdatedAt).
6. **Retorno**: El manejador devuelve un DTO de respuesta y el controlador lo retorna como HTTP 200/201 al cliente React.

---

## 4. Estado de los Sprints y Evolución Arquitectónica

* **Sprint 1: Inicialización Arquitectónica y Esqueleto (Completado)**
  * Estructuración de solución base y 5 proyectos de backend/pruebas.
  * Inicialización de la SPA React con Vite y dependencias NPM.
  * Habilitación inicial de CORS en `PetClinic.Api` permitiendo peticiones desde `http://localhost:5173`.
