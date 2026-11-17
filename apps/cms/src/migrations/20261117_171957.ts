import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
 CREATE TYPE "public"."enum_tienda_envios_zonas_clave" AS ENUM('riobamba', 'otra');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
  DO $$ BEGIN
 CREATE TYPE "public"."enum_tienda_status" AS ENUM('draft', 'published');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
  DO $$ BEGIN
 CREATE TYPE "public"."enum__tienda_v_version_envios_zonas_clave" AS ENUM('riobamba', 'otra');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
  DO $$ BEGIN
 CREATE TYPE "public"."enum__tienda_v_version_status" AS ENUM('draft', 'published');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
  CREATE TABLE IF NOT EXISTS "tienda_envios_zonas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"clave" "enum_tienda_envios_zonas_clave",
  	"etiqueta" varchar,
  	"courier" varchar,
  	"costo" numeric,
  	"gratis_desde" numeric,
  	"nota" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "tienda" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"pago_banco" varchar,
  	"pago_tipo_cuenta" varchar,
  	"pago_numero_cuenta" varchar,
  	"pago_titular" varchar,
  	"pago_ruc" varchar,
  	"pago_qr_id" integer,
  	"pago_nota" varchar,
  	"_status" "enum_tienda_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "_tienda_v_version_envios_zonas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"clave" "enum__tienda_v_version_envios_zonas_clave",
  	"etiqueta" varchar,
  	"courier" varchar,
  	"costo" numeric,
  	"gratis_desde" numeric,
  	"nota" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_tienda_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_pago_banco" varchar,
  	"version_pago_tipo_cuenta" varchar,
  	"version_pago_numero_cuenta" varchar,
  	"version_pago_titular" varchar,
  	"version_pago_ruc" varchar,
  	"version_pago_qr_id" integer,
  	"version_pago_nota" varchar,
  	"version__status" "enum__tienda_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  DO $$ BEGIN
 ALTER TABLE "tienda_envios_zonas" ADD CONSTRAINT "tienda_envios_zonas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tienda"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
  DO $$ BEGIN
 ALTER TABLE "tienda" ADD CONSTRAINT "tienda_pago_qr_id_media_id_fk" FOREIGN KEY ("pago_qr_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
  DO $$ BEGIN
 ALTER TABLE "_tienda_v_version_envios_zonas" ADD CONSTRAINT "_tienda_v_version_envios_zonas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tienda_v"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
  DO $$ BEGIN
 ALTER TABLE "_tienda_v" ADD CONSTRAINT "_tienda_v_version_pago_qr_id_media_id_fk" FOREIGN KEY ("version_pago_qr_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
  CREATE INDEX IF NOT EXISTS "tienda_envios_zonas_order_idx" ON "tienda_envios_zonas" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tienda_envios_zonas_parent_id_idx" ON "tienda_envios_zonas" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tienda_pago_pago_qr_idx" ON "tienda" USING btree ("pago_qr_id");
  CREATE INDEX IF NOT EXISTS "tienda__status_idx" ON "tienda" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_tienda_v_version_envios_zonas_order_idx" ON "_tienda_v_version_envios_zonas" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tienda_v_version_envios_zonas_parent_id_idx" ON "_tienda_v_version_envios_zonas" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tienda_v_version_pago_version_pago_qr_idx" ON "_tienda_v" USING btree ("version_pago_qr_id");
  CREATE INDEX IF NOT EXISTS "_tienda_v_version_version__status_idx" ON "_tienda_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_tienda_v_created_at_idx" ON "_tienda_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_tienda_v_updated_at_idx" ON "_tienda_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_tienda_v_latest_idx" ON "_tienda_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_tienda_v_autosave_idx" ON "_tienda_v" USING btree ("autosave");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "tienda_envios_zonas" CASCADE;
  DROP TABLE "tienda" CASCADE;
  DROP TABLE "_tienda_v_version_envios_zonas" CASCADE;
  DROP TABLE "_tienda_v" CASCADE;
  DROP TYPE "public"."enum_tienda_envios_zonas_clave";
  DROP TYPE "public"."enum_tienda_status";
  DROP TYPE "public"."enum__tienda_v_version_envios_zonas_clave";
  DROP TYPE "public"."enum__tienda_v_version_status";`)
}
