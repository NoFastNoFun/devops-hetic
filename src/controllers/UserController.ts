
import { IUser, IUserCreate, IUserUpdate } from 'model/types/IUser';
import { Body, Delete, Get, Patch, Path, Put, Query, Route, Security } from 'tsoa';
import { IORMIndexResponse, IORMCreateResponse, IORMUpdateResponse, IORMDeleteResponse } from 'utility/ORM/interfaces/IORM';
import { ORM } from 'utility/ORM/ORM';

const READ_COLUMNS = ['userId', 'familyName', 'givenName', 'email'];

/**
 * Un utilisateur de la plateforme.
 */
@Route("/user")
// @Security('jwt')       /** Désactivé pour ce cours pour simplifier les demos */
export class UserController {

  /**
   * Récupérer une page d'utilisateurs.
   */
  @Get()
  public async getUsers(
    /** La page (zéro-index) à récupérer */
    @Query() page?: string,    
    /** Le nombre d'éléments à récupérer (max 50) */
    @Query() limit?: string,    
  ): Promise<IORMIndexResponse<IUser>> {    
    return ORM.Index<IUser>({
      table: 'user',
      columns: READ_COLUMNS,
      query: { page, limit },
    });
  }

  /**
   * Créer un nouvel utilisateur
   */
  @Put()
  public async createUser(
    @Body() body: IUserCreate
  ): Promise<IORMCreateResponse> {
    return ORM.Create<IUserCreate>({
      table: 'user',
      body,
    });
  }

  /**
   * Récupérer une utilisateur avec le ID passé dans le URL
   */
  @Get('{userId}')
  public async readUser(
    @Path() userId: number
  ): Promise<IUser> {
    return ORM.Read<IUser>({
      table: 'user', 
      idKey: 'userId', 
      idValue: userId, 
      columns: READ_COLUMNS
    });
  }

  /**
   * Mettre à jour un utilisateur avec le ID passé dans le URL
   */
  @Patch('{userId}')
  public async updateUser(
    @Path() userId: number,
    @Body() body: IUserUpdate
  ): Promise<IORMUpdateResponse> {
    return ORM.Update<IUserUpdate>({
      table: 'user',
      idKey: 'userId', 
      idValue: userId, 
      body,
    });
  }
  
  /**
   * Supprimer un utilisateur
   */
  @Delete('{userId}')
  public async deleteUser(
    @Path() userId: number,
  ): Promise<IORMDeleteResponse> {
    return ORM.Delete({
      table: 'user', 
      idKey: 'userId', 
      idValue: userId, 
    });
  }
}
