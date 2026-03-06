import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Calculation } from '@/entities/Calculation';
import path from 'path';

const dbPath = process.env.DATABASE_PATH
  ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
  : path.resolve(process.cwd(), './data/cc.sqlite');

declare global {
  // eslint-disable-next-line no-var
  var __dataSource: DataSource | undefined;
}

export async function getDataSource(): Promise<DataSource> {
  if (global.__dataSource && global.__dataSource.isInitialized) {
    return global.__dataSource;
  }

  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: dbPath,
    entities: [Calculation],
    synchronize: true,
    logging: false,
  });

  await dataSource.initialize();
  global.__dataSource = dataSource;
  return dataSource;
}
