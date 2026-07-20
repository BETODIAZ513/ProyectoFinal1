# Guía de Despliegue en Microsoft Azure - PetClinic Management System

Este documento contiene la guía paso a paso para desplegar la arquitectura completa de **PetClinic** en Microsoft Azure utilizando **Azure Container Apps (ACA)** para las aplicaciones web y la API, junto con **Azure SQL Database** como motor de persistencia relacional.

---

## 🏗️ Arquitectura de Despliegue

```
                                  +---------------------------------------+
                                  |         Cliente (Navegador)           |
                                  +-------------------+-------------------+
                                                      |
                                          +-----------+-----------+
                                          |                       |
                                          v                       v
                              +-----------------------+ +-------------------+
                              |     petclinic-web     | |petclinic-portalweb|
                              | Azure Container Apps  | |Azure Container App|
                              +-----------+-----------+ +---------+---------+
                                          |                       |
                                          +-----------+-----------+
                                                      |
                                                      v
                                           +--------------------+
                                           |   petclinic-api    |
                                           |Azure Container App |
                                           +---------+----------+
                                                     |
                                                     v
                                           +--------------------+
                                           | Azure SQL Database |
                                           |  (PaaS Serverless) |
                                           +--------------------+
```

| Componente | Tecnología | Servicio en Azure |
| :--- | :--- | :--- |
| **Backend API** | .NET 10 Web API + EF Core | **Azure Container Apps (ACA)** |
| **Back Office Web** | React + TypeScript + Vite | **Azure Container Apps (ACA)** |
| **Portal Propietario** | React + TypeScript + Vite | **Azure Container Apps (ACA)** |
| **Base de Datos** | SQL Server 2022 | **Azure SQL Database (Serverless)** |
| **Registro de Imágenes** | Docker Images | **Azure Container Registry (ACR)** |

---

## 📋 Prerrequisitos

1. **Cuenta en Azure** con suscripción activa.
2. **Azure CLI** instalado (`az --version`) o acceso a **Azure Cloud Shell**.
3. Repositorio de GitHub sincronizado (`https://github.com/BETODIAZ513/ProyectoFinal1.git`).

---

## 🛠️ Paso 1: Creación del Grupo de Recursos y Registro de Contenedores (ACR)

Abre la terminal de comandos de Azure CLI o Cloud Shell y ejecuta:

```bash
# 1. Iniciar sesión en Azure
az login

# 2. Definir variables
RESOURCE_GROUP="rg-petclinic-prod"
LOCATION="eastus"
ACR_NAME="acrpetclinic$RANDOM"

# 3. Crear el Grupo de Recursos
az group create --name $RESOURCE_GROUP --location $LOCATION

# 4. Crear el Registro de Contenedores (Azure Container Registry)
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true
```

---

## 🗄️ Paso 2: Creación de la Base de Datos (Azure SQL Database)

```bash
SQL_SERVER_NAME="sql-petclinic-$RANDOM"
DATABASE_NAME="PetClinicDb"
SQL_ADMIN_USER="sqladmin"
SQL_ADMIN_PASS="ClinicaMascotas2026#" # Cambiar por una contraseña segura

# 1. Crear el Servidor Lógico de SQL
az sql server create \
  --resource-group $RESOURCE_GROUP \
  --name $SQL_SERVER_NAME \
  --location $LOCATION \
  --admin-user $SQL_ADMIN_USER \
  --admin-password $SQL_ADMIN_PASS

# 2. Permitir acceso a los servicios de Azure (Firewall)
az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME \
  --name "AllowAzureServices" \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# 3. Crear la Base de Datos (Serverless / Auto-pause habilitado)
az sql db create \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME \
  --name $DATABASE_NAME \
  --edition GeneralPurpose \
  --compute-model Serverless \
  --family Gen5 \
  --capacity 1
```

> **Cadena de Conexión Obtenida:**
> `Server=tcp:<SQL_SERVER_NAME>.database.windows.net,1433;Initial Catalog=PetClinicDb;Persist Security Info=False;User ID=sqladmin;Password=ClinicaMascotas2026#;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;`

---

## 📦 Paso 3: Compilación y Subida de Imágenes Docker a ACR

Compilamos las imágenes Docker directamente en la nube utilizando Azure Container Registry:

```bash
# 1. Compilar la imagen del Backend API
az acr build --registry $ACR_NAME --image petclinic-api:latest -f src/PetClinic.Api/Dockerfile .

# 2. Obtener la URL de la API antes de compilar los Frontends (Requerido para inyectar VITE_API_URL)
# El backend se desplegará en el Paso 4.
```

---

## 🚀 Paso 4: Despliegue del Backend API (`petclinic-api`)

```bash
ENVIRONMENT_NAME="env-petclinic"

# 1. Crear el entorno de Azure Container Apps
az containerapp env create \
  --name $ENVIRONMENT_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# 2. Obtener credenciales de ACR
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)
ACR_SERVER=$(az acr show --name $ACR_NAME --query "loginServer" -o tsv)

# 3. Cadena de conexión de Azure SQL
CONN_STRING="Server=tcp:$SQL_SERVER_NAME.database.windows.net,1433;Initial Catalog=$DATABASE_NAME;Persist Security Info=False;User ID=$SQL_ADMIN_USER;Password=$SQL_ADMIN_PASS;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

# 4. Desplegar la API en Container Apps
az containerapp create \
  --name petclinic-api \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT_NAME \
  --image "$ACR_SERVER/petclinic-api:latest" \
  --target-port 80 \
  --ingress external \
  --registry-server $ACR_SERVER \
  --registry-username $ACR_NAME \
  --registry-password $ACR_PASSWORD \
  --env-vars "ConnectionStrings__DefaultConnection=$CONN_STRING"

# 5. Obtener la URL pública asignada a la API
API_URL=$(az containerapp show --name petclinic-api --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv)
API_URL="https://$API_URL"
echo "URL de la API: $API_URL"
```

*Nota:* Al ejecutarse la API por primera vez, el archivo `Program.cs` ejecutará la migración y la semilla de datos (`DbInitializer.cs`), creando las tablas y datos ficticios automáticamente en Azure SQL.

---

## 💻 Paso 5: Compilación y Despliegue de los Frontends (`petclinic-web` y `portalweb`)

Una vez que tenemos la URL pública de la API (`$API_URL`), compilamos las imágenes de los frontends inyectando esta variable de entorno:

### 1. Back Office (`petclinic-web`)

```bash
# Compilar la imagen desde la carpeta src/PetClinic.Web inyectando VITE_API_URL
cd src/PetClinic.Web
az acr build --registry $ACR_NAME --image petclinic-web:latest --build-arg VITE_API_URL=$API_URL .
cd ~/ProyectoFinal1

# Desplegar la Container App del Backoffice
az containerapp create \
  --name petclinic-web \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT_NAME \
  --image "$ACR_SERVER/petclinic-web:latest" \
  --target-port 80 \
  --ingress external \
  --registry-server $ACR_SERVER \
  --registry-username $ACR_NAME \
  --registry-password $ACR_PASSWORD
```

### 2. Portal del Cliente (`petclinic-portalweb`)

```bash
# Compilar la imagen desde la carpeta src/PetClinic.PortalWeb inyectando VITE_API_URL
cd src/PetClinic.PortalWeb
az acr build --registry $ACR_NAME --image petclinic-portalweb:latest --build-arg VITE_API_URL=$API_URL .
cd ~/ProyectoFinal1

# Desplegar la Container App del Portal de Clientes
az containerapp create \
  --name petclinic-portalweb \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT_NAME \
  --image "$ACR_SERVER/petclinic-portalweb:latest" \
  --target-port 80 \
  --ingress external \
  --registry-server $ACR_SERVER \
  --registry-username $ACR_NAME \
  --registry-password $ACR_PASSWORD
```

---

## 🔑 Credenciales por Defecto Sembradas en Producción

Una vez finalizado el despliegue, podrás ingresar a la URL pública de `petclinic-web` con los siguientes usuarios:

| Rol | Usuario / Correo | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin1` / `admin1@petclinic.com` | `Admin123!` |
| **Veterinario** | `vet1` / `vet1@petclinic.com` | `Admin123!` |
| **Recepcionista** | `recep1` / `recep1@petclinic.com` | `Admin123!` |
| **Propietarios (Portal)** | `propietario1@test.com` al `40` | `Admin123!` |

---

## 🧹 Limpieza de Recursos (Opcional)

Si deseas eliminar todos los recursos creados en Azure para evitar cargos adicionales:

```bash
az group delete --name $RESOURCE_GROUP --yes --no-wait
```
