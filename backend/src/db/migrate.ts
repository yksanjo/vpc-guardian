import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from './index';
import { logger } from '../utils/logger';

async function migrate() {
  try {
    const migrationSQL = readFileSync(
      join(__dirname, 'migrations', '001_initial_schema.sql'),
      'utf-8'
    );

    await pool.query(migrationSQL);
    logger.info('Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();

