## 1. Configuración de Infraestructura y Orquestación

- [ ] 1.1 Modificar `docker-compose.yml` para agregar el servicio `petclinic-db` y mapear puertos/volúmenes.
- [ ] 1.2 Actualizar las variables de entorno de la API en `docker-compose.yml` para pasar la cadena de conexión de SQL Server del contenedor.

## 2. Verificación de Funcionamiento

- [ ] 2.1 Detener contenedores actuales y ejecutar `docker-compose up -d --build`.
- [ ] 2.2 Conectar SQL Server Management Studio (SSMS) a `localhost` usando las credenciales configuradas y verificar la creación de tablas.
- [ ] 2.3 Ejecutar consultas SQL básicas para comprobar la persistencia de datos tras apagar y reiniciar contenedores.
