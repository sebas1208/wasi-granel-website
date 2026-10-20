import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Canonical price (ticket 12): products.price / products.price_unit, a "money" purchase-option
 * kind with products_purchase_options.amount, and price sorting.
 *
 * Written to be IDEMPOTENT and additive on purpose: the previous migration (20261009_120000)
 * already added `products.popular` on production, so re-adding it here would abort the boot
 * (`payload migrate && next start`) and take the CMS down. Every statement is guarded so the
 * migration is safe to apply on both the already-migrated production DB and a fresh one.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
     CREATE TYPE "public"."enum_products_price_unit" AS ENUM('lb', 'kg', 'gr', 'unidad');
   EXCEPTION WHEN duplicate_object THEN NULL;
   END $$;
   ALTER TYPE "public"."enum_products_purchase_options_kind" ADD VALUE IF NOT EXISTS 'money';
   ALTER TABLE "products_purchase_options" ALTER COLUMN "price" DROP NOT NULL;
   ALTER TABLE "products_purchase_options" ADD COLUMN IF NOT EXISTS "amount" numeric;
   ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "price" numeric;
   ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "price_unit" "enum_products_price_unit" DEFAULT 'lb';
   CREATE INDEX IF NOT EXISTS "products_price_idx" ON "products" USING btree ("price");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "products_price_idx";
   ALTER TABLE "products" DROP COLUMN IF EXISTS "price_unit";
   ALTER TABLE "products" DROP COLUMN IF EXISTS "price";
   DROP TYPE IF EXISTS "public"."enum_products_price_unit";
   ALTER TABLE "products_purchase_options" DROP COLUMN IF EXISTS "amount";
   ALTER TABLE "products_purchase_options" ALTER COLUMN "kind" SET DATA TYPE text;
   DROP TYPE IF EXISTS "public"."enum_products_purchase_options_kind";
   CREATE TYPE "public"."enum_products_purchase_options_kind" AS ENUM('weight', 'unit');
   ALTER TABLE "products_purchase_options" ALTER COLUMN "kind" SET DEFAULT 'weight'::"public"."enum_products_purchase_options_kind";
   ALTER TABLE "products_purchase_options" ALTER COLUMN "kind" SET DATA TYPE "public"."enum_products_purchase_options_kind" USING "kind"::text::"public"."enum_products_purchase_options_kind";`)
}
