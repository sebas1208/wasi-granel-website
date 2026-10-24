import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_contacto_pillars_icon" AS ENUM('eco', 'scale', 'hub', 'recycling', 'favorite');
  CREATE TYPE "public"."enum_contacto_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__contacto_v_version_pillars_icon" AS ENUM('eco', 'scale', 'hub', 'recycling', 'favorite');
  CREATE TYPE "public"."enum__contacto_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_inicio_benefits_icon" AS ENUM('scale', 'recycling', 'terrain', 'eco', 'storefront', 'local_shipping');
  CREATE TYPE "public"."enum_inicio_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__inicio_v_version_benefits_icon" AS ENUM('scale', 'recycling', 'terrain', 'eco', 'storefront', 'local_shipping');
  CREATE TYPE "public"."enum__inicio_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_footer_navigation_path" AS ENUM('/', '/tienda', '/contacto');
  CREATE TYPE "public"."enum_footer_legal_document" AS ENUM('terms', 'privacy');
  CREATE TYPE "public"."enum_footer_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__footer_v_version_navigation_path" AS ENUM('/', '/tienda', '/contacto');
  CREATE TYPE "public"."enum__footer_v_version_legal_document" AS ENUM('terms', 'privacy');
  CREATE TYPE "public"."enum__footer_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "contacto_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_contacto_pillars_icon" DEFAULT 'eco',
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "contacto_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"line" varchar
  );
  
  CREATE TABLE "contacto_branches_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"service" varchar
  );
  
  CREATE TABLE "contacto_branches" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"tab_label" varchar,
  	"badge" varchar,
  	"region" varchar,
  	"description" varchar,
  	"address" varchar,
  	"phone" varchar,
  	"maps_url" varchar,
  	"maps_cid" varchar
  );
  
  CREATE TABLE "contacto" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"general_email" varchar,
  	"general_city" varchar,
  	"general_courier" varchar,
  	"general_courier_scope" varchar,
  	"hero_eyebrow" varchar,
  	"hero_title_top" varchar,
  	"hero_title_accent" varchar,
  	"hero_body" varchar,
  	"hero_visit_title" varchar,
  	"hero_visit_sub" varchar,
  	"faq_question" varchar,
  	"faq_answer" varchar,
  	"_status" "enum_contacto_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_contacto_v_version_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__contacto_v_version_pillars_icon" DEFAULT 'eco',
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contacto_v_version_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"line" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contacto_v_version_branches_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"service" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contacto_v_version_branches" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"tab_label" varchar,
  	"badge" varchar,
  	"region" varchar,
  	"description" varchar,
  	"address" varchar,
  	"phone" varchar,
  	"maps_url" varchar,
  	"maps_cid" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contacto_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_general_email" varchar,
  	"version_general_city" varchar,
  	"version_general_courier" varchar,
  	"version_general_courier_scope" varchar,
  	"version_hero_eyebrow" varchar,
  	"version_hero_title_top" varchar,
  	"version_hero_title_accent" varchar,
  	"version_hero_body" varchar,
  	"version_hero_visit_title" varchar,
  	"version_hero_visit_sub" varchar,
  	"version_faq_question" varchar,
  	"version_faq_answer" varchar,
  	"version__status" "enum__contacto_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "inicio_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_inicio_benefits_icon" DEFAULT 'scale',
  	"label" varchar,
  	"sub" varchar
  );
  
  CREATE TABLE "inicio_history_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "inicio" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar,
  	"hero_kicker" varchar,
  	"hero_title" varchar,
  	"hero_body" varchar,
  	"hero_cta_primary_label" varchar,
  	"hero_cta_secondary_label" varchar,
  	"history_eyebrow" varchar,
  	"history_title" varchar,
  	"history_body1" varchar,
  	"history_body2" varchar,
  	"history_badge_title" varchar,
  	"history_badge_sub" varchar,
  	"categories_eyebrow" varchar,
  	"categories_title" varchar,
  	"categories_cta_label" varchar,
  	"popular_title" varchar,
  	"popular_cta_label" varchar,
  	"newsletter_title" varchar,
  	"newsletter_body" varchar,
  	"newsletter_cta_label" varchar,
  	"newsletter_placeholder" varchar,
  	"_status" "enum_inicio_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_inicio_v_version_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__inicio_v_version_benefits_icon" DEFAULT 'scale',
  	"label" varchar,
  	"sub" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inicio_v_version_history_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inicio_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_eyebrow" varchar,
  	"version_hero_kicker" varchar,
  	"version_hero_title" varchar,
  	"version_hero_body" varchar,
  	"version_hero_cta_primary_label" varchar,
  	"version_hero_cta_secondary_label" varchar,
  	"version_history_eyebrow" varchar,
  	"version_history_title" varchar,
  	"version_history_body1" varchar,
  	"version_history_body2" varchar,
  	"version_history_badge_title" varchar,
  	"version_history_badge_sub" varchar,
  	"version_categories_eyebrow" varchar,
  	"version_categories_title" varchar,
  	"version_categories_cta_label" varchar,
  	"version_popular_title" varchar,
  	"version_popular_cta_label" varchar,
  	"version_newsletter_title" varchar,
  	"version_newsletter_body" varchar,
  	"version_newsletter_cta_label" varchar,
  	"version_newsletter_placeholder" varchar,
  	"version__status" "enum__inicio_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "footer_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"path" "enum_footer_navigation_path"
  );
  
  CREATE TABLE "footer_legal" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"document" "enum_footer_legal_document"
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"brand_blurb" varchar,
  	"location_city" varchar,
  	"location_branches_line" varchar,
  	"legal_line" varchar,
  	"_status" "enum_footer_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_footer_v_version_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"path" "enum__footer_v_version_navigation_path",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_legal" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"document" "enum__footer_v_version_legal_document",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_brand_blurb" varchar,
  	"version_location_city" varchar,
  	"version_location_branches_line" varchar,
  	"version_legal_line" varchar,
  	"version__status" "enum__footer_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "contacto_pillars" ADD CONSTRAINT "contacto_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contacto"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contacto_hours" ADD CONSTRAINT "contacto_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contacto"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contacto_branches_services" ADD CONSTRAINT "contacto_branches_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contacto_branches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contacto_branches" ADD CONSTRAINT "contacto_branches_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contacto"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contacto_v_version_pillars" ADD CONSTRAINT "_contacto_v_version_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contacto_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contacto_v_version_hours" ADD CONSTRAINT "_contacto_v_version_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contacto_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contacto_v_version_branches_services" ADD CONSTRAINT "_contacto_v_version_branches_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contacto_v_version_branches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contacto_v_version_branches" ADD CONSTRAINT "_contacto_v_version_branches_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contacto_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inicio_benefits" ADD CONSTRAINT "inicio_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inicio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inicio_history_stats" ADD CONSTRAINT "inicio_history_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inicio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inicio_v_version_benefits" ADD CONSTRAINT "_inicio_v_version_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inicio_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inicio_v_version_history_stats" ADD CONSTRAINT "_inicio_v_version_history_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inicio_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_navigation" ADD CONSTRAINT "footer_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal" ADD CONSTRAINT "footer_legal_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_navigation" ADD CONSTRAINT "_footer_v_version_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_legal" ADD CONSTRAINT "_footer_v_version_legal_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "contacto_pillars_order_idx" ON "contacto_pillars" USING btree ("_order");
  CREATE INDEX "contacto_pillars_parent_id_idx" ON "contacto_pillars" USING btree ("_parent_id");
  CREATE INDEX "contacto_hours_order_idx" ON "contacto_hours" USING btree ("_order");
  CREATE INDEX "contacto_hours_parent_id_idx" ON "contacto_hours" USING btree ("_parent_id");
  CREATE INDEX "contacto_branches_services_order_idx" ON "contacto_branches_services" USING btree ("_order");
  CREATE INDEX "contacto_branches_services_parent_id_idx" ON "contacto_branches_services" USING btree ("_parent_id");
  CREATE INDEX "contacto_branches_order_idx" ON "contacto_branches" USING btree ("_order");
  CREATE INDEX "contacto_branches_parent_id_idx" ON "contacto_branches" USING btree ("_parent_id");
  CREATE INDEX "contacto__status_idx" ON "contacto" USING btree ("_status");
  CREATE INDEX "_contacto_v_version_pillars_order_idx" ON "_contacto_v_version_pillars" USING btree ("_order");
  CREATE INDEX "_contacto_v_version_pillars_parent_id_idx" ON "_contacto_v_version_pillars" USING btree ("_parent_id");
  CREATE INDEX "_contacto_v_version_hours_order_idx" ON "_contacto_v_version_hours" USING btree ("_order");
  CREATE INDEX "_contacto_v_version_hours_parent_id_idx" ON "_contacto_v_version_hours" USING btree ("_parent_id");
  CREATE INDEX "_contacto_v_version_branches_services_order_idx" ON "_contacto_v_version_branches_services" USING btree ("_order");
  CREATE INDEX "_contacto_v_version_branches_services_parent_id_idx" ON "_contacto_v_version_branches_services" USING btree ("_parent_id");
  CREATE INDEX "_contacto_v_version_branches_order_idx" ON "_contacto_v_version_branches" USING btree ("_order");
  CREATE INDEX "_contacto_v_version_branches_parent_id_idx" ON "_contacto_v_version_branches" USING btree ("_parent_id");
  CREATE INDEX "_contacto_v_version_version__status_idx" ON "_contacto_v" USING btree ("version__status");
  CREATE INDEX "_contacto_v_created_at_idx" ON "_contacto_v" USING btree ("created_at");
  CREATE INDEX "_contacto_v_updated_at_idx" ON "_contacto_v" USING btree ("updated_at");
  CREATE INDEX "_contacto_v_latest_idx" ON "_contacto_v" USING btree ("latest");
  CREATE INDEX "inicio_benefits_order_idx" ON "inicio_benefits" USING btree ("_order");
  CREATE INDEX "inicio_benefits_parent_id_idx" ON "inicio_benefits" USING btree ("_parent_id");
  CREATE INDEX "inicio_history_stats_order_idx" ON "inicio_history_stats" USING btree ("_order");
  CREATE INDEX "inicio_history_stats_parent_id_idx" ON "inicio_history_stats" USING btree ("_parent_id");
  CREATE INDEX "inicio__status_idx" ON "inicio" USING btree ("_status");
  CREATE INDEX "_inicio_v_version_benefits_order_idx" ON "_inicio_v_version_benefits" USING btree ("_order");
  CREATE INDEX "_inicio_v_version_benefits_parent_id_idx" ON "_inicio_v_version_benefits" USING btree ("_parent_id");
  CREATE INDEX "_inicio_v_version_history_stats_order_idx" ON "_inicio_v_version_history_stats" USING btree ("_order");
  CREATE INDEX "_inicio_v_version_history_stats_parent_id_idx" ON "_inicio_v_version_history_stats" USING btree ("_parent_id");
  CREATE INDEX "_inicio_v_version_version__status_idx" ON "_inicio_v" USING btree ("version__status");
  CREATE INDEX "_inicio_v_created_at_idx" ON "_inicio_v" USING btree ("created_at");
  CREATE INDEX "_inicio_v_updated_at_idx" ON "_inicio_v" USING btree ("updated_at");
  CREATE INDEX "_inicio_v_latest_idx" ON "_inicio_v" USING btree ("latest");
  CREATE INDEX "footer_navigation_order_idx" ON "footer_navigation" USING btree ("_order");
  CREATE INDEX "footer_navigation_parent_id_idx" ON "footer_navigation" USING btree ("_parent_id");
  CREATE INDEX "footer_legal_order_idx" ON "footer_legal" USING btree ("_order");
  CREATE INDEX "footer_legal_parent_id_idx" ON "footer_legal" USING btree ("_parent_id");
  CREATE INDEX "footer__status_idx" ON "footer" USING btree ("_status");
  CREATE INDEX "_footer_v_version_navigation_order_idx" ON "_footer_v_version_navigation" USING btree ("_order");
  CREATE INDEX "_footer_v_version_navigation_parent_id_idx" ON "_footer_v_version_navigation" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_legal_order_idx" ON "_footer_v_version_legal" USING btree ("_order");
  CREATE INDEX "_footer_v_version_legal_parent_id_idx" ON "_footer_v_version_legal" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_version__status_idx" ON "_footer_v" USING btree ("version__status");
  CREATE INDEX "_footer_v_created_at_idx" ON "_footer_v" USING btree ("created_at");
  CREATE INDEX "_footer_v_updated_at_idx" ON "_footer_v" USING btree ("updated_at");
  CREATE INDEX "_footer_v_latest_idx" ON "_footer_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "contacto_pillars" CASCADE;
  DROP TABLE "contacto_hours" CASCADE;
  DROP TABLE "contacto_branches_services" CASCADE;
  DROP TABLE "contacto_branches" CASCADE;
  DROP TABLE "contacto" CASCADE;
  DROP TABLE "_contacto_v_version_pillars" CASCADE;
  DROP TABLE "_contacto_v_version_hours" CASCADE;
  DROP TABLE "_contacto_v_version_branches_services" CASCADE;
  DROP TABLE "_contacto_v_version_branches" CASCADE;
  DROP TABLE "_contacto_v" CASCADE;
  DROP TABLE "inicio_benefits" CASCADE;
  DROP TABLE "inicio_history_stats" CASCADE;
  DROP TABLE "inicio" CASCADE;
  DROP TABLE "_inicio_v_version_benefits" CASCADE;
  DROP TABLE "_inicio_v_version_history_stats" CASCADE;
  DROP TABLE "_inicio_v" CASCADE;
  DROP TABLE "footer_navigation" CASCADE;
  DROP TABLE "footer_legal" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "_footer_v_version_navigation" CASCADE;
  DROP TABLE "_footer_v_version_legal" CASCADE;
  DROP TABLE "_footer_v" CASCADE;
  DROP TYPE "public"."enum_contacto_pillars_icon";
  DROP TYPE "public"."enum_contacto_status";
  DROP TYPE "public"."enum__contacto_v_version_pillars_icon";
  DROP TYPE "public"."enum__contacto_v_version_status";
  DROP TYPE "public"."enum_inicio_benefits_icon";
  DROP TYPE "public"."enum_inicio_status";
  DROP TYPE "public"."enum__inicio_v_version_benefits_icon";
  DROP TYPE "public"."enum__inicio_v_version_status";
  DROP TYPE "public"."enum_footer_navigation_path";
  DROP TYPE "public"."enum_footer_legal_document";
  DROP TYPE "public"."enum_footer_status";
  DROP TYPE "public"."enum__footer_v_version_navigation_path";
  DROP TYPE "public"."enum__footer_v_version_legal_document";
  DROP TYPE "public"."enum__footer_v_version_status";`)
}
