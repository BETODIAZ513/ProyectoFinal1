## 1. Modificaciones de Código y Ajustes de Clave

- [x] 1.1 Modificar `docker-compose.yml` para actualizar contraseña a `ClinicaMascotas2026#` y renombrar el contenedor de BD.
- [x] 1.2 Actualizar `DbInitializer.cs` para sembrar 2 administradores, 4 médicos, 3 auxiliares, 2 recepcionistas y el resto de las tablas clínicas.
- [x] 1.3 Modificar `Program.cs` para pasar el DbContext a la función de sembrado.

## 2. Ejecución y Respaldo de Base de Datos

- [x] 2.1 Detener contenedores, eliminar volumen y reiniciar con `docker-compose up --build` para forzar re-sembrado.
- [x] 2.2 Ejecutar comando de `BACKUP DATABASE` dentro del contenedor SQL Server y copiar el archivo `.bak` resultante a la raíz.
- [x] 2.3 Conectarse exitosamente desde SSMS utilizando la dirección IP `127.0.0.1` y la nueva clave.
