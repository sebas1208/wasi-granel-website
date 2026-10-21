import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Marketing copy fields: products.short_description + the products_benefits array (ticket 12 v2).
 *
 * Idempotent on purpose: the container boots with `payload migrate && next start`, so a statement
 * that throws takes the CMS down. Every statement is guarded and the FK is dropped-then-added, so
 * the migration is safe to re-apply.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "products_benefits" (
  \t"_order" integer NOT NULL,
  \t"_parent_id" integer NOT NULL,
  \t"id" varchar PRIMARY KEY NOT NULL,
  \t"text" varchar NOT NULL
  );

  ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "short_description" varchar;
  ALTER TABLE "products_benefits" DROP CONSTRAINT IF EXISTS "products_benefits_parent_id_fk";
  ALTER TABLE "products_benefits" ADD CONSTRAINT "products_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX IF NOT EXISTS "products_benefits_order_idx" ON "products_benefits" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "products_benefits_parent_id_idx" ON "products_benefits" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "products_benefits" CASCADE;
  ALTER TABLE "products" DROP COLUMN IF EXISTS "short_description";`)
}
