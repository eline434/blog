import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Raw SQL on purpose: this keeps working if the Topics collection changes later.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    INSERT INTO "topics" ("title", "slug", "generate_slug", "color", "order") VALUES
      ('UX', 'ux', true, 'blue', 10),
      ('Design', 'design', true, 'orange', 20),
      ('Dev', 'dev', true, 'aqua', 30),
      ('Project management', 'project-management', true, 'yellow', 40)
    ON CONFLICT ("slug") DO NOTHING;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "topics" WHERE "slug" IN ('ux', 'design', 'dev', 'project-management');
  `)
}
