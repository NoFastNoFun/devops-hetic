import { readFile } from 'fs/promises';
import { createPool } from 'mysql2/promise';
import { PoolOptions } from 'mysql2/typings/mysql';
import { join } from 'path';

/** Class utilitaire pour réinitialiser la base de données 
 * - On DROP la base existant, si elle existe, 
 * - on en crée une nouvelle, 
 * - on importe le DDL
 * - (optionnelle) on fait executer les instructions SEED (remplir la base avec les données de test)
*/
export class RootDB {
  static async Reset() {

    const database = process.env.DB_DATABASE || "school_test";

    const config: PoolOptions = {         
      host: process.env.DB_HOST || "dbms",
      user: process.env.DB_ROOT_USER || "root",      
      password: process.env.DB_ROOT_PASSWORD || "rootpassword",
      multipleStatements: true
    };
    const POOL = createPool(config);

    const setup = await readFile(join('dbms', 'ddl', 'init-test.sql'), { encoding: 'utf-8'});   
    await POOL.query(setup);

    const ddl = await readFile(join('dbms', 'ddl', 'ddl.sql'), { encoding: 'utf-8'});
    await POOL.query(`use ${database}; ${ddl}`);

    await POOL.end();
  }
}