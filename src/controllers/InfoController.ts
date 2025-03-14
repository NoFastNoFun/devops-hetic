
import { RowDataPacket } from 'mysql2';
import { hostname, platform, type } from 'os';
import { Get, Route } from 'tsoa';
import { DB } from 'utility/ORM/DB';
import { IORMTableCount } from 'utility/ORM/interfaces/IORM';

interface IInfo {
  /**
   * Nom de l'API
   */
  title: string;
  /**
   * Le nom d'hôte sur lequel l'API tourne
   */
  host: string;
  /**
   * Le type de OS 
   */
  platform: string;
  /**
   * Le OS 
   */
  type: string;
  /**
   * Le statut de l'OS
   */
  database: {
    state: 'connected'|'disconnected';
    error?: string;
  }
  /**
   * Nom de l'étudiant
   */
  name: string;
}

@Route("/info")
export class InfoController {

  /**
   * Récupérer une page d'utilisateurs.
   */
  @Get()
  public async getInfo(   
  ): Promise<IInfo> {    
    const info: IInfo = {
      title: "DevOps Code Samples API",
      host: hostname(),
      platform: platform(),
      type: type(),
      database: {
        state: 'disconnected'
      },
      name: "LAUNAY ETHAN"
    }

    try  {
      const db = DB.Connection;
      await db.query<IORMTableCount[] & RowDataPacket[]>(`select count(*) as total from user`);
      info.database.state = 'connected';
    } catch (err: any) {
      info.database.error = err?.message || 'Database could not be contacted';
    }

    return info;
  }
}
