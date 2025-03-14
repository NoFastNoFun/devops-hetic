
/// --- CREATE --- ///

import { DbTable } from "model/DbTable";

/**
 * Requête pour la création d'une ligne
 */
export interface IORMCreateRequest<T> {
  table: DbTable;
  body: T;
}

/**
 * Réponse à une operation d'insertion d'une ligne
 */
export interface IORMCreateResponse {
  /**
   * ID de la ligne créée
   */
  id: number;
}


/// --- READ --- ///

/**
 * Paramètres modifiant une requête (pour la pagination)
 */
export interface IORMIndexQueryParams {
  page?: string;
  limit?: string;  
}

/**
 * Block de conditions sur la requête aupres de la ba de données
 */
export type IORMReadWhere = Record<string, string|number>;


/*
 * Requête pour récupérer un ensemble de lignes
 */
export interface IORMIndexRequest {
  /**
   * La table de la base de données à interroger
   */  
  table: DbTable; 
  /**
   * Un tableau de colonnes à retourner
   */
  columns: string[];
  /**
   * Comment filtrer les lignes
   */  
  where?: IORMReadWhere;
  /**
   * Comment gérer la pagination
   */
  query?: IORMIndexQueryParams;
}

/**
 * Réspone à une opération de lecture de plusieurs lignes.
 */
export interface IORMIndexResponse<T> {
  page: number;
  limit: number;
  total: number;
  rows: T[];
}

export interface IORMReadRequest {
  table: DbTable;
  /**
   * Le nom de la colonne qui contient la clé primaire ou ID de la ligne demandée
   */
  idKey: string;
  /**
   * La valeur de l'ID
   */
  idValue: number|string;
  columns: string[];
}

/**
 * Structure retourné par MySQL quand on fait une requête de type `count(*)` 
 */
export interface IORMTableCount {
  total: number;
}

/// --- UPDATE --- ///

export interface IORMUpdateRequest<T> {  
  table: DbTable;
  /**
   * Le nom de la colonne qui contient la clé primaire ou ID de la ligne demandée
   */
  idKey: string;
  /**
   * La valeur de l'ID
   */
  idValue: number|string;

  /**
   * La mise à jour à effectuer
   */
  body: T;
}

/**
 * Réponse à une operation de mise à jour
 */
export interface IORMUpdateResponse {
  id: number|string;
  rows: number;
}

/// --- DELETE --- ///

export interface IORMDeleteRequest {
  table: DbTable, 
  /**
   * Le nom de la colonne qui contient la clé primaire ou ID de la ligne demandée
   */
  idKey: string, 
  /**
   * La valeur de l'ID
   */
  idValue: number|string
}

/**
 * Réponse à une operation de suppression d'une ligne
 */
export interface IORMDeleteResponse {
  id: number|string;
  rows: number;
}




