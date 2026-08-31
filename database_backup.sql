-- ============================================================
-- RiwiMediCare Plus - Backup de Base de Datos (PostgreSQL)
-- Esta estructura es generada por Sequelize (tablas y relaciones)
-- ============================================================

BEGIN;

-- Tipo enum para roles de usuario
DO $$ BEGIN
  CREATE TYPE "enum_users_role" AS ENUM ('admin', 'gestor');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tipo enum para estados de solicitud
DO $$ BEGIN
  CREATE TYPE "enum_supply_requests_status" AS ENUM ('pendiente', 'en_proceso', 'completada', 'cancelada');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tabla: users
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(150) NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "role" "enum_users_role" DEFAULT 'gestor',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabla: clinics
CREATE TABLE IF NOT EXISTS "clinics" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(150) NOT NULL,
  "nit" VARCHAR(30) NOT NULL UNIQUE,
  "address" VARCHAR(200) NOT NULL,
  "phone" VARCHAR(30) NOT NULL,
  "responsibleId" INTEGER NOT NULL REFERENCES "users"("id"),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabla: warehouses
CREATE TABLE IF NOT EXISTS "warehouses" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(150) NOT NULL,
  "location" VARCHAR(200) NOT NULL,
  "responsibleId" INTEGER NOT NULL REFERENCES "users"("id"),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabla: medications
CREATE TABLE IF NOT EXISTS "medications" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(150) NOT NULL,
  "description" TEXT NOT NULL,
  "unitPrice" DECIMAL(10,2) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabla: warehouse_medications (stock por almacén y medicamento)
CREATE TABLE IF NOT EXISTS "warehouse_medications" (
  "id" SERIAL PRIMARY KEY,
  "warehouseId" INTEGER NOT NULL REFERENCES "warehouses"("id"),
  "medicationId" INTEGER NOT NULL REFERENCES "medications"("id"),
  "stock" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT "warehouse_medications_warehouseId_medicationId_unique" UNIQUE ("warehouseId", "medicationId")
);

-- Tabla: supply_requests
CREATE TABLE IF NOT EXISTS "supply_requests" (
  "id" SERIAL PRIMARY KEY,
  "clinicId" INTEGER NOT NULL REFERENCES "clinics"("id"),
  "warehouseId" INTEGER NOT NULL REFERENCES "warehouses"("id"),
  "medicationId" INTEGER NOT NULL REFERENCES "medications"("id"),
  "quantity" INTEGER NOT NULL,
  "status" "enum_supply_requests_status" NOT NULL DEFAULT 'pendiente',
  "requestedById" INTEGER NOT NULL REFERENCES "users"("id"),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Índices para optimizar consultas frecuentes
CREATE INDEX IF NOT EXISTS "supply_requests_clinicId" ON "supply_requests"("clinicId");
CREATE INDEX IF NOT EXISTS "supply_requests_status" ON "supply_requests"("status");

COMMIT;
