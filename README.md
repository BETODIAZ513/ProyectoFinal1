# PetClinic Management System

Sistema de gestión para clínicas veterinarias desarrollado utilizando **Arquitectura Limpia (Clean Architecture)** con backend en .NET 10 (Web API) y frontend SPA (React + TypeScript con Vite), siguiendo la metodología SDD (Spec-Driven Development) a través de **OpenSpec**.

## Estructura del Proyecto
* **`src/PetClinic.Domain`**: Capa de dominio (Entidades y Enums puras).
* **`src/PetClinic.Application`**: Capa de aplicación (CQRS, MediatR, Validadores).
* **`src/PetClinic.Infrastructure`**: Capa de infraestructura (Persistencia, EF Core, Identity, SQL Server).
* **`src/PetClinic.Api`**: Capa de presentación del backend (ASP.NET Core Web API).
* **`src/PetClinic.Web`**: Capa de presentación del cliente (React + TS SPA).
* **`tests/`**: Suite de pruebas unitarias y de integración.
