import { Kysely, PostgresDialect } from "kysely";
import { DB } from './DatabaseTypes.js';
import pg from "pg"
import { config } from 'dotenv'
import { Environment } from "./Environment.js";

config();

export const database = new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({
        user: Environment.VITE_TASKLINER_DB_USER,
        password: Environment.VITE_TASKLINER_DB_PASSWORD,
        host: Environment.VITE_TASKLINER_DB_HOST,
        port: Number(Environment.VITE_TASKLINER_DB_PORT),
        database: Environment.VITE_TASKLINER_DB_DATABASE,
        ssl: { ca: Environment.VITE_TASKLINER_DB_CERT }
      }),
    }),
  })