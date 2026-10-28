import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
  CREATE TYPE "public"."enum_orders_items_kind" AS ENUM('weight', 'unit');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
  DO $$ BEGIN
  CREATE TYPE "public"."enum_orders_status" AS ENUM('nuevo', 'enviado', 'pagado', 'entregado', 'cancelado', 'vencido');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
  DO $$ BEGIN
  CREATE TYPE "public"."enum_orders_zone" AS ENUM('riobamba', 'otra');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
  DO $$ BEGIN
  CREATE TYPE "public"."enum_orders_payment_method" AS ENUM('transferencia', 'deuna', 'contra_entrega');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
  CREATE TABLE IF NOT EXISTS "orders_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"option_label" varchar,
  	"kind" "enum_orders_items_kind" NOT NULL,
  	"grams" numeric,
  	"amount" numeric,
  	"qty" numeric DEFAULT 1 NOT NULL,
  	"unit_price" numeric NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar NOT NULL,
  	"status" "enum_orders_status" DEFAULT 'nuevo' NOT NULL,
  	"customer_name" varchar NOT NULL,
  	"customer_phone" varchar NOT NULL,
  	"customer_address" varchar NOT NULL,
  	"customer_note" varchar,
  	"zone" "enum_orders_zone" NOT NULL,
  	"subtotal" numeric NOT NULL,
  	"shipping" numeric,
  	"total" numeric,
  	"payment_method" "enum_orders_payment_method",
  	"whatsapp_consent" boolean DEFAULT false NOT NULL,
  	"whatsapp_consent_at" timestamp(3) with time zone,
  	"message_sent_at" timestamp(3) with time zone,
  	"paid_at" timestamp(3) with time zone,
  	"delivered_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "enable_a_p_i_key" boolean;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "api_key" varchar;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "api_key_index" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "orders_id" integer;
  ALTER TABLE "_contacto_v" ADD COLUMN IF NOT EXISTS "autosave" boolean;
  ALTER TABLE "_inicio_v" ADD COLUMN IF NOT EXISTS "autosave" boolean;
  ALTER TABLE "_footer_v" ADD COLUMN IF NOT EXISTS "autosave" boolean;
  DO $$ BEGIN
 ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
  DO $$ BEGIN
 ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
  CREATE INDEX IF NOT EXISTS "orders_items_order_idx" ON "orders_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "orders_items_parent_id_idx" ON "orders_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "orders_items_product_idx" ON "orders_items" USING btree ("product_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "orders_reference_idx" ON "orders" USING btree ("reference");
  CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" USING btree ("status");
  CREATE INDEX IF NOT EXISTS "orders_customer_customer_phone_idx" ON "orders" USING btree ("customer_phone");
  CREATE INDEX IF NOT EXISTS "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders" USING btree ("created_at");
  DO $$ BEGIN
 ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX IF NOT EXISTS "_contacto_v_autosave_idx" ON "_contacto_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "_inicio_v_autosave_idx" ON "_inicio_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "_footer_v_autosave_idx" ON "_footer_v" USING btree ("autosave");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "orders_items" CASCADE;
  DROP TABLE "orders" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_orders_fk";
  
  DROP INDEX "payload_locked_documents_rels_orders_id_idx";
  DROP INDEX "_contacto_v_autosave_idx";
  DROP INDEX "_inicio_v_autosave_idx";
  DROP INDEX "_footer_v_autosave_idx";
  ALTER TABLE "users" DROP COLUMN "enable_a_p_i_key";
  ALTER TABLE "users" DROP COLUMN "api_key";
  ALTER TABLE "users" DROP COLUMN "api_key_index";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "orders_id";
  ALTER TABLE "_contacto_v" DROP COLUMN "autosave";
  ALTER TABLE "_inicio_v" DROP COLUMN "autosave";
  ALTER TABLE "_footer_v" DROP COLUMN "autosave";
  DROP TYPE "public"."enum_orders_items_kind";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_zone";
  DROP TYPE "public"."enum_orders_payment_method";`)
}
