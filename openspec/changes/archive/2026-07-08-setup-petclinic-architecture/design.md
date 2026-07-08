## Context

Se requiere inicializar la solución `PetClinic` siguiendo una división clásica de arquitectura limpia para backend y desacoplando la capa de presentación web en una aplicación de cliente único (SPA). Esto asegura separación completa de incumbencias y flexibilidad para consumir la API desde múltiples clientes en el futuro.

## Goals / Non-Goals

**Goals:**
- Estructurar la solución `PetClinic.sln` con los proyectos de backend: Domain, Application, Infrastructure y Api.
- Crear el proyecto de pruebas unitarias `PetClinic.Application.UnitTests`.
- Configurar las dependencias de proyectos del backend de acuerdo a la dirección unidireccional (Domain <- Application <- Infrastructure <- Api).
- Crear e inicializar el proyecto frontend `PetClinic.Web` en `src/PetClinic.Web` como una aplicación SPA utilizando React y TypeScript.
- Configurar el soporte de CORS en `PetClinic.Api` para permitir el consumo desde `PetClinic.Web`.

**Non-Goals:**
- Implementar la lógica del negocio o persistencia funcional.
- Desarrollar la UI completa del frontend.
- Cargar esquemas o semillas de bases de datos reales.

## Decisions

### 1. Backend Web API (`PetClinic.Api`)
- **Decisión**: La capa de presentación backend será un proyecto de Web API en lugar de MVC con vistas.
- **Razón**: Permite exponer endpoints en formato JSON de forma limpia, aptos para ser consumidos por cualquier cliente SPA (como React).
- **Alternativas consideradas**: Controladores MVC tradicionales con Razor. Descartado para cumplir con el desacoplamiento SPA de la capa de cliente.

### 2. Frontend React + TypeScript SPA (`PetClinic.Web`)
- **Decisión**: El proyecto cliente `PetClinic.Web` se inicializará como una SPA usando React con TypeScript, construida sobre Vite.
- **Razón**: Vite proporciona un entorno de desarrollo sumamente rápido y moderno. React y TypeScript ofrecen una base robusta y tipada para la interfaz de precisión clínica ("Clinical Precision").
- **Alternativas consideradas**: Angular, Vue, o HTML/JS vanilla. Se elige React + TS por su popularidad, facilidad de integración y compatibilidad con el stack moderno.

### 3. Configuración de CORS
- **Decisión**: Habilitar políticas de CORS (Cross-Origin Resource Sharing) en `PetClinic.Api` para permitir peticiones provenientes del puerto de desarrollo de Vite (usualmente `http://localhost:5173`).
- **Razón**: Al ejecutar backend y frontend en puertos distintos en desarrollo, el navegador bloqueará las peticiones si no se habilitan las cabeceras CORS.

## Risks / Trade-offs

- **[Riesgo] Mayor complejidad de despliegue**: Al tener una separación física de backend y frontend, se requieren dos entornos de ejecución o un paso de compilación que sirva los archivos estáticos desde la API.
  - *Mitigación*: En producción, se compilará la SPA y se puede alojar de manera estática o configurar la API para servir los archivos compilados de la carpeta `dist`. En desarrollo, correrán de forma paralela (dotnet run y npm run dev).
