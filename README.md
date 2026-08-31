# RiwiMediCare Plus - API de Abastecimiento de Medicamentos

API REST para gestionar las solicitudes de abastecimiento de medicamentos e insumos médicos de la empresa **RiwiMediCare Plus**.

## Nombre del Coder

**Stevel Iglesias**

## Clan

Clan Node.js

## Tecnologías Utilizadas

- **Node.js** v18 o superior
- **Express** v5
- **TypeScript** (tipado estricto)
- **Sequelize** (ORM)
- **PostgreSQL** (Base de datos relacional)
- **JSON Web Token (JWT)** (Autenticación)
- **Swagger / Swagger UI** (Documentación)
- **Multer** (Subida de archivos JSON para seeders)
- **Jest** (Pruebas unitarias)
- **Docker / Docker Compose** (Deploy)

## Estructura del Proyecto

```
src/
├── app.ts                    # Configuración de la aplicación Express
├── server.ts                 # Punto de entrada del servidor
├── config/
│   └── database.ts           # Conexión a PostgreSQL
├── controllers/              # Lógica de negocio
│   ├── auth.controller.ts
│   ├── clinic.controller.ts
│   ├── medication.controller.ts
│   ├── seeder.controller.ts
│   ├── supplyRequest.controller.ts
│   └── warehouse.controller.ts
├── middlewares/              # Middlewares
│   ├── auth.middleware.ts    # Verificación JWT
│   ├── error.middleware.ts   # Manejo de errores
│   ├── role.middleware.ts    # Control de roles
│   └── validation.middleware.ts
├── models/                   # Modelos Sequelize
│   ├── User.ts
│   ├── Clinic.ts
│   ├── Warehouse.ts
│   ├── Medication.ts
│   ├── WarehouseMedication.ts
│   ├── SupplyRequest.ts
│   └── index.ts
├── routes/                   # Definición de rutas
├── seeders/
│   └── data/                 # Archivos JSON de data de prueba
├── swagger/                  # Configuración Swagger
├── types/                    # Interfaces y tipos TypeScript
└── __tests__/                # Pruebas unitarias
```

## Instructivo de Instalación

### Requisitos previos
- Node.js v18 o superior
- PostgreSQL instalado y corriendo
- (Opcional) Docker y Docker Compose

### Pasos

1. Clonar el repositorio:
```bash
git clone <URL_DEL_REPOSITORIO>
cd backeng_node
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar las variables de entorno:
Crear un archivo `.env` en la raíz del proyecto a partir del ejemplo.

4. Crear la base de datos en PostgreSQL:
```sql
CREATE DATABASE rimimedicare_db;
```

## Ejemplo de Variables de Entorno (.env)

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=rimimedicare_db
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=mi_super_secreto_jwt_2024
JWT_EXPIRES_IN=24h
```

## Ejecución del Proyecto

### Modo desarrollo
```bash
npm run dev
```

### Modo producción
```bash
npm run build
npm start
```

El servidor correrá en `http://localhost:3000`
- **Swagger UI:** `http://localhost:3000/api-docs`
- **Health check:** `http://localhost:3000/api/health`

## Ejecución de Seeders (Carga de data de prueba)

La base de datos se puebla mediante un Endpoint con **multer** que recibe un archivo JSON.

### 1. Registrarse (no requiere token)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"123456","role":"admin"}'
```

### 2. Iniciar sesión para obtener el token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"123456"}'
```

### 3. Cargar el archivo JSON de seeders
```bash
curl -X POST http://localhost:3000/api/seeders/upload \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@src/seeders/data/seed-data.json"
```

## Endpoints Principales

### Autenticación
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| POST | `/api/auth/register` | Registrar usuario | Público |
| POST | `/api/auth/login` | Iniciar sesión | Público |
| GET | `/api/auth/users` | Listar usuarios | Autenticado |

### Clínicas
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/api/clinics` | Listar clínicas | Autenticado |
| GET | `/api/clinics/:id` | Clínica por ID | Autenticado |
| POST | `/api/clinics` | Crear clínica | Admin |
| PUT | `/api/clinics/:id` | Actualizar clínica | Admin |
| DELETE | `/api/clinics/:id` | Eliminar clínica | Admin |

### Almacenes
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/api/warehouses` | Listar almacenes | Autenticado |
| GET | `/api/warehouses/:id` | Almacén por ID | Autenticado |
| POST | `/api/warehouses` | Crear almacén | Admin |
| PUT | `/api/warehouses/:id` | Actualizar almacén | Admin |
| DELETE | `/api/warehouses/:id` | Eliminar almacén | Admin |

### Medicamentos
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/api/medications` | Listar medicamentos | Autenticado |
| GET | `/api/medications/:id` | Medicamento por ID | Autenticado |
| POST | `/api/medications` | Crear medicamento | Admin |
| PUT | `/api/medications/:id` | Actualizar medicamento | Admin |
| DELETE | `/api/medications/:id` | Eliminar medicamento | Admin |
| POST | `/api/medications/stock` | Asignar stock a almacén | Admin |

### Solicitudes de Abastecimiento
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/api/supply-requests` | Listar solicitudes activas | Autenticado |
| GET | `/api/supply-requests/:id` | Solicitud por ID | Autenticado |
| POST | `/api/supply-requests` | Crear solicitud | Admin, Gestor |
| PATCH | `/api/supply-requests/:id/status` | Actualizar estado | Admin, Gestor |
| GET | `/api/supply-requests/history/:clinicId` | Historial por clínica | Autenticado |
| DELETE | `/api/supply-requests/:id` | Eliminar solicitud | Admin |

## Reglas de Negocio

### Estados de Solicitud (transiciones válidas)
- `pendiente` → `en_proceso` | `cancelada`
- `en_proceso` → `completada` | `cancelada`
- `completada` → (terminal)
- `cancelada` → (terminal)

### Validaciones
- No se permiten clínicas con el mismo NIT.
- No se permiten cantidades menores o iguales a cero.
- No se permite crear solicitudes sin stock suficiente en el almacén.
- No se permiten transiciones de estado inválidas.
- La eliminación es lógica (soft delete) mediante `isActive = false`.

## Permisos por Rol

| Acción | Admin | Gestor |
|--------|:-----:|:------:|
| CRUD Clínicas | ✅ | ❌ |
| CRUD Almacenes | ✅ | ❌ |
| CRUD Medicamentos | ✅ | ❌ |
| Crear solicitud | ✅ | ✅ |
| Actualizar estado | ✅ | ✅ |
| Consultar solicitudes | ✅ | ✅ |
| Historial por clínica | ✅ | ✅ |
| Eliminar solicitud | ✅ | ❌ |
| Cargar seeders | ✅ | ❌ |

## Pruebas Unitarias

```bash
npm test                 # Ejecuta las pruebas con cobertura
npm test -- --coverage   # Ejecuta pruebas con reporte de cobertura
```

Cobertura superior al 40% verificable en los tests.

## Despliegue con Docker

### Docker Compose (recomendado)
```bash
docker-compose up --build
```

Levanta dos contenedores:
- **API** en `http://localhost:3000`
- **PostgreSQL** en `localhost:5432`

Con volumen para persistencia y red interna entre servicios.

### Dockerfile
```bash
docker build -t rimimedicare-api .
docker run -p 3000:3000 rimimedicare-api
```

## Documentación de Endpoints (Swagger)

Todos los endpoints están documentados e incluyen:
- Método HTTP
- Ruta
- Descripción
- Parámetros
- Request Body
- Códigos de respuesta
- Ejemplos de petición y respuesta

La interfaz Swagger UI es accesible en: `http://localhost:3000/api-docs`

## URL del Repositorio en GitHub

[URL del repositorio público en GitHub]

## Estrategia de Ramas (Gitflow)

- `main` - Rama principal de producción
- `develop` - Rama de desarrollo
- `feature/*` - Ramas de funcionalidades

Commits siguiendo **Conventional Commits**:
```bash
feat: create user registration endpoint
fix: correct stock validation on supply request
docs: update README with installation steps
chore: update dependencies
```
