
import { json } from "body-parser";
import Cors from 'cors';
import Express from "express";
import { createServer, Server } from "http";
import swaggerUi from 'swagger-ui-express';
import { RegisterRoutes } from './routes/routes';
import { initGraphQL } from "routes/graphql.route";
import { DefaultErrorHandler } from "utility/error/error-handler.middleware";
import { Log } from "utility/logging/Log";
import { requestLogMiddleware } from "utility/logging/log.middleware";

export const StartServer = async () => {
  // Récupérer le port des variables d'environnement ou préciser une valeur par défaut
  const PORT = process.env.PORT || 5055;

  // Créer l'objet Express
  const app = Express();
  const httpServer = createServer(app);

  // Configurer CORS
  app.use(Cors())

  // L'appli parse le corps du message entrant comme du json
  app.use(json());

  // Utiliser un middleware pour créer des logs
  app.use(requestLogMiddleware('req'));

  RegisterRoutes(app);

  // Servir le contenu static du dossier `public`
  app.use(Express.static("public"));
  // Créer une route qui permet de convertir le .json en format html
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      swaggerOptions: {
        url: "/swagger.json",
      },
    })
  );

  // Graphql
  const graphql = await initGraphQL(httpServer);
  app.use('/graphql', graphql);

  // Ajouter un handler pour les erreurs
  app.use(DefaultErrorHandler);

  // Lancer le serveur
  return new Promise<Server>(
    (resolve) => {
      httpServer.listen(PORT, () => {
        Log(`API Listening on port ${PORT}`)
        resolve(httpServer);
      })     
    }
  ); 
}

export const StopServer = async (server: Server|undefined) => {
  if (!server) { return; }
  return new Promise<void>(
    (resolve, reject) => {
      server.close(
        (err) => {
          if (err) {
            reject(err);            
          } else {
            resolve();
          }
        }
      )
    }
  );  
}

