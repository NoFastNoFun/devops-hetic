
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { DB } from "./DB";
import { IORMCreateResponse, IORMIndexRequest, IORMIndexResponse, IORMCreateRequest, IORMTableCount, IORMUpdateResponse, IORMReadRequest, IORMUpdateRequest } from "./interfaces/IORM";
import { DbTable } from "model/DbTable";
import { ApiError } from "utility/error/apiError";
import { ErrorCode } from "utility/error/ErrorCode";


/**
 * Class qui fournit des fonctions utilitaires pour les opérations ICRUD.
 * 
 * @todo Pour l'instant la fonction Index ne marche que sur une seule table. Ajouter une fonction qui permet de faire des requêtes plus complexes (avec des joins et/ou aggrégations). Est-qu'il est possible de généraliser au maximum une telle opération, tout en laissant de la fléxibilité ?
 */
export class ORM {

  /**
   * Ajoute une ligne dans la base de données
   * @param options 
   * @returns ICreateResponse
   */
  public static async Create<T>(options: IORMCreateRequest<T>): Promise<IORMCreateResponse> {
    const db = DB.Connection;
    const data = await db.query<ResultSetHeader>(`insert into ${options.table} set ?`, options.body);

    return {
      id: data[0].insertId
    }   
  }

  /**
   * Récupérer une page de lignes d'une table, en précisant les colonnes souhaitées   
   */
  public static async Index<T>(options: IORMIndexRequest) : Promise<IORMIndexResponse<T>> {

    const db = DB.Connection;      
    // On suppose que le params query sont en format string, et potentiellement
    // non-numérique, ou corrompu
    const page = parseInt(options.query?.page || "0") || 0;
    const limit = parseInt(options.query?.limit || "10") || 0;
    
    const offset = page * limit;

    // D'abord, récupérer le nombre total
    let whereClause = '';
    let whereValues: any[] = [];
    if (options.where) {
      const whereList: string[] = [];
      Object.entries(options.where).forEach(
        ([key, value]) => {
          whereList.push(key + ' = ?');
          whereValues.push(value);
        }
      )
      whereClause = 'where  ' + whereList.join(' and ');
    }

    // console.log(mysql.format(`select count(*) as total from ${table} ${whereClause}`, whereValues))

    const count = await db.query<IORMTableCount[] & RowDataPacket[]>(`select count(*) as total from ${options.table} ${whereClause}`, whereValues);      

    // Récupérer les lignes
    const sqlBase = `select ${options.columns.join(',')} from ${options.table} ${whereClause} limit ? offset ?`;
    const data = await db.query<T[] & RowDataPacket[]>(sqlBase, [...whereValues, limit, offset].filter(e => e !== undefined));

    // Construire la réponse
    const res: IORMIndexResponse<T> = {
      page,
      limit,
      total: count[0][0].total,
      rows: data[0]
    }

    return res;
  }

  /**
   * Récupérer une ligne dans la base de données, étant donné son identifiant
   * @param options 
   * @returns 
   * @throws ApiError si aucune ligne n'est trouvée
   */
  public static async Read<T>(options: IORMReadRequest): Promise<T> {
    const db = DB.Connection;
    const data = await db.query<T[] & RowDataPacket[]>(`select ${options.columns.join(',')} from ${options.table} where ${options.idKey} = ?`, [options.idValue]);      

    if (data[0].length > 0) {
      return data[0][0];
    } else {
      throw new ApiError(ErrorCode.BadRequest, 'sql/not-found', `Could not read row with ${options.idKey} = ${options.idValue}`);
    }
  }



  public static async Update<T>(options: IORMUpdateRequest<T>): Promise<IORMUpdateResponse> {
    const db = DB.Connection;

    const data = await db.query<ResultSetHeader>(`update ${options.table} set ? where ${options.idKey} = ?`, [options.body, options.idValue]);

    return {
      id: options.idValue,
      rows: data[0].affectedRows
    } 
  }
  

  public static async Delete(options: {
    table: DbTable, 
    idKey: string, 
    idValue: number|string
  }): Promise<IORMUpdateResponse> {
    const db = DB.Connection;
    const data = await db.query<ResultSetHeader>(`delete from ${options.table} where ${options.idKey} = ?`, [options.idValue]);      

    return {
      id: options.idValue,
      rows: data[0].affectedRows
    }  
  }

}