// Initialize TypeORM data source
import {AppDataSource} from "./utils/db";
import express from "express";
import http from "http";
import {ApolloServer} from "@apollo/server";
import {execSchema, MyContext} from "./execSchema";
import {ApolloServerPluginDrainHttpServer} from "@apollo/server/plugin/drainHttpServer";
import {expressMiddleware} from "@apollo/server/express4";
import cors from "cors";
import pkg from 'body-parser';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
const { json } = pkg;

//Create Express app/apolloServer
const app = express();
const server = http.createServer(app);

// Create WebSocket server with different path for subscriptions
const wsServer = new WebSocketServer({
  server,
  path: '/graphql',
});

// CORS Options
const corsOptions: cors.CorsOptions = {
  origin: "*", //TODO: Change to specific origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204
};

async function startServer() {
  await AppDataSource.initialize().then(async () => {
    console.log("Database initialized");
  }).catch((error: any) => console.log(error));

  // Initialize WebSocket server for GraphQL subscriptions
  const serverCleanup = useServer(
    {
      schema: execSchema,
      context: async () => ({
        dataSource: AppDataSource
      })
    },
    wsServer
  );

  //Apply schema and plugins to apolloServer
  const apolloServer = new ApolloServer<MyContext>({
    schema: execSchema,
    introspection: true,
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer: server }),
      
      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await apolloServer.start();

  //Apply express middleware, and run on route /graphql
  app.use(
      '/graphql',
      cors<cors.CorsRequest>(corsOptions),
      json(),
      expressMiddleware(apolloServer, {
        context: async () => ({dataSource: AppDataSource})
      })
    );

  // Run on Railway port or 8000 when ran locally
  const envPort = process.env.PORT
  const port = envPort && Number.parseInt(envPort) || 3000;

  await new Promise<void>((resolve) => server.listen({port: port}, resolve)).then(() => {
      console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
      console.log(`🚀 Subscriptions ready at ws://localhost:${port}/graphql`);
    }
  );
}

startServer().catch((error) => console.error('Error starting server:', error));



