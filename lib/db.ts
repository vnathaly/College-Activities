import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:123456@localhost:5432/integrador?schema=public";

const pool = new Pool({
  connectionString,
});

export const query = (text: string, params: any[] = []) => {
  return pool.query(text, params);
};


export default pool; 
