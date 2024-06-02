import * as path from 'path'
import { cp, promises as fs } from 'fs'
import pg from "pg";
import { FileMigrationProvider, Kysely, Migrator, PostgresDialect, sql } from "kysely";
import dotenv from "dotenv";

dotenv.config()

const db = new Kysely({
    dialect: new PostgresDialect({
      pool: new pg.Pool({
        user: process.env.VITE_TASKLINER_DB_USER,
        password: process.env.VITE_TASKLINER_DB_PASSWORD,
        host: process.env.VITE_TASKLINER_DB_HOST,
        port: Number(process.env.VITE_TASKLINER_DB_PORT),
        database: process.env.VITE_TASKLINER_DB_DATABASE,
        ssl: {
            ca: process.env.VITE_TASKLINER_DB_CERT
        }
      }),
    }),
  })

const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
        fs,
        path,
        migrationFolder: path.join(process.cwd(), 'migrations'),
    }),
    allowUnorderedMigrations: true
})

console.log("Checkpoint 1")

const { error, results } = await (async() => {
    const command = process.argv[2];

    // Down
    if (command === "down") {
        return await migrator.migrateDown();
    }

    // Up
    else if (command === "up") {
        return await migrator.migrateUp();
    }

    // Latest
    else if (command === "latest") {
        return await migrator.migrateToLatest();
    }

    
    // No Command
    else {
        throw new Error("No migration command defined (up / down / latest)")
    }
})()

results?.forEach((it) => {
  if (it.status === 'Success') {
    console.log(`migration "${it.migrationName}" was executed successfully`)
  } else if (it.status === 'Error') {
    console.error(`failed to execute migration "${it.migrationName}"`)
  }
})

if (error) {
  console.error('failed to migrate')
  console.error(error)
  process.exit(1)
}

await db.destroy();