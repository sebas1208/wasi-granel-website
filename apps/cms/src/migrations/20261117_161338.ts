import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_orders_items_kind" ADD VALUE IF NOT EXISTS 'money';
  ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "privacy_consent" boolean DEFAULT false NOT NULL;
  ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "privacy_consent_at" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders_items" ALTER COLUMN "kind" SET DATA TYPE text;
  DROP TYPE "public"."enum_orders_items_kind";
  CREATE TYPE "public"."enum_orders_items_kind" AS ENUM('weight', 'unit');
  ALTER TABLE "orders_items" ALTER COLUMN "kind" SET DATA TYPE "public"."enum_orders_items_kind" USING "kind"::"public"."enum_orders_items_kind";
  ALTER TABLE "orders" DROP COLUMN "privacy_consent";
  ALTER TABLE "orders" DROP COLUMN "privacy_consent_at";`)
}
