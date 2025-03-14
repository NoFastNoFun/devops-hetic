import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import { Router } from "express";
import { Server } from "http";
import { GRAPHQL_RESOLVERS } from "model/graphql/resolvers.graphql";
import { GRAPHQL_SCHEMA } from "model/graphql/schema.graphql";

export const initGraphQL = async (server: Server) => {
  const apollo = new ApolloServer({
    typeDefs: GRAPHQL_SCHEMA,
    resolvers: GRAPHQL_RESOLVERS,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer: server })],
  });

  await apollo.start();

  const router = Router({ mergeParams: true });

  router.use(
    <any>expressMiddleware(apollo, {
      /*
      context: async ({ req, res }) => {
        try {
          return await expressAuthentication(<any>req, 'jwt');        
        } catch (err: any) {
          throw new GraphQLError('User is not authenticated', {
            extensions: {
              code: 'UNAUTHENTICATED',
              http: { status: err.httpCode },
            }
          });
        }
      }
      */
    })
  )

  return router;
}
