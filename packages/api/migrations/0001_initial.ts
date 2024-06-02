import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createTable("workspace")
    .addColumn("id", "text", col => col.primaryKey())
    .addColumn("creation_time", "timestamptz")
    .addColumn("name", "text")
    .execute()

  await db.schema.createTable("project")
    .addColumn("workspace_id", "text", col => col.references("workspace.id").onDelete("cascade"))
    .addColumn("id", "text", col => col.unique())
    .addColumn("creation_time", "timestamptz")
    .addColumn("name", "text")
    .addColumn("deadline_start", "timestamptz")
    .addColumn("deadline_end", "timestamptz")
    .addPrimaryKeyConstraint("project_primary_key", ["workspace_id", "id"])
    .execute()

  await db.schema.createTable("task")
    .addColumn("project_id", "text", col => col.references("project.id").onDelete("cascade"))
    .addColumn("id", "text", col => col.unique())
    .addColumn("creation_time", "timestamptz")
    .addColumn("name", "text")
    .addColumn("deadline_start", "timestamptz")
    .addColumn("deadline_end", "timestamptz")
    .addPrimaryKeyConstraint("task_primary_key", ["project_id", "id"])
    .execute()

  await db.schema.createTable("x_object")
    .addColumn("id", "text", col => col.primaryKey())
    .addColumn("deleted", "boolean", col => col.notNull().defaultTo(false))
    .addColumn("created_timestamp", "timestamptz", col => col.notNull())
    .addColumn("updated_timestamp", "timestamptz", col => col.notNull())
    .addColumn("data", "jsonb", col => col.notNull().defaultTo("{}"))
    .execute()

  await db.schema.createTable("x_event")
    .addColumn("version", "bigserial", col => col.primaryKey())
    .addColumn("timestamp", "timestamptz", col => col.notNull())
    .addColumn("target_id", "text")
    .addColumn("type", "text")
    .addColumn("action", "text")
    .addColumn("data", "jsonb")
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("x_event").execute();
  await db.schema.dropTable("x_task").execute();

  await db.schema.dropTable("task").execute();
  await db.schema.dropTable("project").execute();
  await db.schema.dropTable("workspace").execute();
}