## 1. Configuración de Identidad y Auditoría en Backend

- [ ] 1.1 Definir la clase `ApplicationUser` heredando de `IdentityUser` en `PetClinic.Infrastructure`.
- [ ] 1.2 Crear el contexto de base de datos `PetClinicDbContext` heredando de `IdentityDbContext<ApplicationUser>` en `PetClinic.Infrastructure`.
- [ ] 1.3 Configurar las propiedades de sombra (Shadow Properties: `CreatedBy`, `CreatedAt`, `UpdatedAt`) en `PetClinicDbContext`.
- [ ] 1.4 Definir la interfaz `ICurrentUserService` en `PetClinic.Application`.
- [ ] 1.5 Implementar `CurrentUserService` en `PetClinic.Api` utilizando `IHttpContextAccessor`.
- [ ] 1.6 Sobrescribir `SaveChanges` y `SaveChangesAsync` en `PetClinicDbContext` para inyectar automáticamente los metadatos de auditoría antes de persistir los cambios.

## 2. Autenticación JWT y API de Seguridad

- [ ] 2.1 Definir la interfaz `IJwtTokenGenerator` en `PetClinic.Application`.
- [ ] 2.2 Implementar `JwtTokenGenerator` en `PetClinic.Infrastructure` utilizando configuraciones de firma simétrica.
- [ ] 2.3 Crear los DTOs de autenticación (`LoginRequest`, `LoginResponse`, `UserDto`) en `PetClinic.Application`.
- [ ] 2.4 Configurar la autenticación JWT Bearer en el `Program.cs` de `PetClinic.Api` leyendo parámetros de `appsettings.json`.
- [ ] 2.5 Crear el controlador `AuthController` en `PetClinic.Api` expuesto en `/api/auth/login` y `/api/auth/me`.
- [ ] 2.6 Proporcionar una clase de semilla de datos (Data Seeding) para crear roles (`Administrador`, `Veterinario`, `AuxiliarClinico`, `Recepcionista`) y usuarios de prueba.

## 3. Autenticación y Contexto en el Frontend

- [ ] 3.1 Instalar dependencias esenciales de enrutamiento e iconos (`react-router-dom` y `lucide-react`) en `PetClinic.Web`.
- [ ] 3.2 Crear el contexto de autenticación `AuthContext` en React para manejar tokens, estado de sesión, perfiles y cierre de sesión.
- [ ] 3.3 Diseñar e implementar la vista de Login en `PetClinic.Web` siguiendo lineamientos estéticos modernos ("Clinical Precision").
- [ ] 3.4 Implementar el componente `ProtectedRoute` para interceptar la navegación y bloquear páginas basadas en la autenticación y roles de usuario.

## 4. Navegación Dinámica (Ribbon Menu) y Dashboards por Rol

- [ ] 4.1 Implementar el menú tipo cinta (Ribbon Menu) adaptativo por rol en `PetClinic.Web`.
- [ ] 4.2 Configurar el enrutamiento principal de la aplicación con controles condicionales de acceso.
- [ ] 4.3 Implementar la pantalla `/inicio` que carge vistas parciales o componentes de dashboard específicos por rol.

## 5. Compilación, Validación y Documentación

- [ ] 5.1 Ejecutar `dotnet build` en la raíz para validar la compilación sin errores.
- [ ] 5.2 Ejecutar `dotnet test` para asegurar la Suite de Pruebas.
- [ ] 5.3 Actualizar el documento de arquitectura global `architecture.md` con los detalles técnicos del Sprint 2.
