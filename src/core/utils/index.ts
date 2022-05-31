import { Pool } from 'pg';
import { POSTGRES_DATABASE, POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_PORT, POSTGRES_USER } from 'core/constants';

export const pool = new Pool({
  user: POSTGRES_USER,
  host: POSTGRES_HOST,
  database: POSTGRES_DATABASE,
  password: POSTGRES_PASSWORD,
  port: POSTGRES_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});
