import { NoSuchKey } from '@aws-sdk/client-s3';

import express from "express";
import { IUserFileCreate, IUserFile } from 'model/types/IUserFile';
import multer from "multer";
import { Get, Middlewares, Path, Post, Query, Request, Route, SuccessResponse } from 'tsoa';
import { ApiError } from 'utility/error/apiError';
import { ErrorCode } from 'utility/error/ErrorCode';
import { IORMCreateResponse, IORMIndexResponse } from 'utility/ORM/interfaces/IORM';
import { ORM } from 'utility/ORM/ORM';
import { ObjectStorage } from 'utility/storage/ObjectStorage';
import { v4 } from 'uuid';

/**
 * Controller pour le téléchargement des fichiers concernant un utilisateur
 */
@Route("/user/{userId}/file")
export class UserFileController {

  /**
   * Envoyer un fichier
   * @param userId Le ID de l'utilisateur
   */
  @Post()
  @Middlewares(multer().single("file"))
  public async uploadFile(@Path() userId: number, @Request() request: express.Request): Promise<IORMCreateResponse> {
    
    if (!request.file) {
      throw new ApiError(ErrorCode.BadRequest, 'object/invalid-multipart', 'Missing file data in multi-part upload');
    }

    const filename = (request.file.filename || request.file.originalname || v4());
    const storageKey =  `user/${userId}/${filename}`;

    await ObjectStorage.upload(
      request.file.buffer,
      storageKey,
      request.file.mimetype,          
    )

    const result = await ORM.Create<IUserFileCreate>({
      table: 'user_file',
      body: {
        userId,
        storageKey,
        filename,
        mimeType: request.file.mimetype
      }
    });

    return result;
  } 

  /**
   * Récupérer une liste de fichiers d'un utilisateur
   */
  @Get()
  public async showFiles(
    @Path() userId: number,
    /** La page (zéro-index) à récupérer */
    @Query() page?: string,    
    /** Le nombre d'éléments à récupérer (max 50) */
    @Query() limit?: string,    
  ): Promise<IORMIndexResponse<IUserFile>> {
    return ORM.Index<IUserFile>({
      table: 'user_file',
      columns: ['fileId', 'userId', 'storageKey', 'mimeType'],
      where: { userId },
      query: { page, limit }
    });
  }

  /**
   * Récupérer un fichier selon son ID. Le résultat est une série de messages (statut 200) contenant les contenus du fichier.
   */
  @Get("{fileId}")
  @SuccessResponse("200", "Chunked object stream") // Custom success response
  public async downloadFile(@Path() fileId: number, @Request() request: express.Request) {
    
    const response = request.res;
    if (!response) {
      throw new ApiError(ErrorCode.InternalError, 'object/invalid-response', "A response object was not available")
    }

    // D'abord, récupérer la ligne dans la table, afin de récupérer la clé du stockage objet
    const file = await ORM.Read<IUserFile>({
      table: 'user_file',
      idKey: 'fileId',
      idValue: fileId,
      columns: ['fileId', 'storageKey', 'mimeType']
    });
     
    // Ensuite lancer et streamer la réponse
    await new Promise<void>(
      async (resolve, reject) => {
        try {
          const stream = await ObjectStorage.download(file.storageKey);
          request.res!.writeHead(200, {
            'Content-Type': file.mimeType || 'application/octet-stream',
            'Transfer-Encoding': 'chunked'
          });
          stream.on('data', (chunk) => { response.write(chunk); });
          stream.on('error', (err) => {
            throw(err);
          });
          stream.on('end', () => {
            response.end();
            resolve();
          })

        } catch (err) {
          if (err instanceof NoSuchKey) {
            reject(new ApiError(ErrorCode.InternalError, 'object/key-not-found-in-storage', 'Key not found in storage', { key: file.storageKey }));
          } else {
            reject(err)
          }          
        }
      }
    )
  }
}