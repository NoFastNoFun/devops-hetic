
import { GraphQLResolveInfo } from "graphql";
import { IUser, IUserCreate, IUserUpdate } from "model/types/IUser";
import { IUserFile } from "model/types/IUserFile";
import { ORM } from "utility/ORM/ORM";

const READ_COLUMNS = ['userId', 'familyName', 'givenName', 'email'];


export const GRAPHQL_RESOLVERS = {
  Query: {
    users: async (parent: any, args: any, contextValue: any, info: GraphQLResolveInfo) => {
      const users = await ORM.Index<IUser>({
        table: 'user',
        columns: READ_COLUMNS,
        //query: { page, limit },
      })
      return users.rows;      
    }, 
    user: async (parent: any, args: any, contextValue: any, info: GraphQLResolveInfo) => {
      return ORM.Read<IUser>({
        table: 'user', 
        idKey: 'userId', 
        idValue: args.userId, 
        columns: READ_COLUMNS
      });
    },    
  },
  
  User: {
    files: async (parent: IUser) => {
      const files = await ORM.Index<IUserFile>({
        table: 'user_file',
        columns: ['fileId', 'userId', 'storageKey', 'filename', 'mimeType'],
        where: {
          userId: parent.userId
        }
      })
      return files.rows;      
    }
  },
  Mutation: {
    addUser: async (parent: any, args: IUserCreate, contextValue: any, info: GraphQLResolveInfo) => {
      const result = await ORM.Create<IUserCreate>({
        table: 'user',
        body: args,
      });
      return await ORM.Read<IUser>({
        table: 'user',
        idKey: 'userId',
        idValue: result.id,
        columns: READ_COLUMNS
      })
    },
    updateUser: async (parent: any, args: { userId: number, user: IUserUpdate }, contextValue: any, info: GraphQLResolveInfo) => {
      const result = await ORM.Update<IUserUpdate>({
        table: 'user',
        idKey: 'userId', 
        idValue: args.userId, 
        body: args.user,
      });
      return await ORM.Read<IUser>({
        table: 'user',
        idKey: 'userId',
        idValue: result.id,
        columns: READ_COLUMNS
      })
    },
    deleteUser: async (parent: any, args: { userId: number }, contextValue: any, info: GraphQLResolveInfo) => {
      await ORM.Delete({
        table: 'user',
        idKey: 'userId', 
        idValue: args.userId,         
      });
      return true;
    },
  }

};