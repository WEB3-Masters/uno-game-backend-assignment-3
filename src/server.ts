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
const { json } = pkg;

//Create Express app/apolloServer
const app = express();
const server = http.createServer(app);

//Cors Options (May or may not be necessary)
const corsOptions: cors.CorsOptions = {
  origin: "*", //TODO: Change to specific origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204
}

async function startServer() {
  await AppDataSource.initialize().then(async () => {
    console.log("Database initialized");
  }).catch((error: any) => console.log(error));

  //Apply schema and plugins to apolloServer
  const apolloServer = new ApolloServer<MyContext>({
    schema: execSchema,
    introspection: true,
    plugins: [ApolloServerPluginDrainHttpServer({httpServer: server})]
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
  )

  // Run on Railway port or 8000 when ran locally
  const envPort = process.env.PORT
  const port = envPort && Number.parseInt(envPort) || 3000;

  await new Promise<void>((resolve) => server.listen({port: port}, resolve));
  console.log(`🚀 Server listening at: ${port}`);
}

startServer().catch((error) => console.error('Error starting server:', error));



