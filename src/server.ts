import { ApolloServer } from '@apollo/server';
import http from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors';
import pkg from 'body-parser';
const { json } = pkg;
/* Database data source */
import { AppDataSource } from './utils/db'
/* Executable Schema */
import { execSchema } from './execSchema';

interface MyContext {
  dataSource: typeof AppDataSource
}

//Create Express app/server
const app = express();
const httpServer = http.createServer(app);

//Apply schema and plugins to server
const server = new ApolloServer<MyContext>({
  schema: execSchema,
  introspection: true,
  plugins: [ApolloServerPluginDrainHttpServer({httpServer})]
});

// Initialize TypeORM data source
await AppDataSource.initialize().then(async () => {
  console.log("Postgres TypeORM Database initialized");
}).catch((error: any) => console.log(error));

//Start server
await server.start();

//Cors Options (May or may not be necessary)
const corsOptions: cors.CorsOptions = {
  origin: "*", //TODO: Change to specific origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204
}

//Apply express middleware, and run on route /graphql
app.use(
    '/graphql',
    cors<cors.CorsRequest>(corsOptions),
    json(),
    expressMiddleware(server, {
      context: async () => ({dataSource: AppDataSource})
    })
)

// Run on Railway port or 8000 when ran locally
const envPort = process.env.PORT
const port = envPort && Number.parseInt(envPort) || 3000;

await new Promise<void>((resolve) => httpServer.listen({port: port}, resolve));
console.log(`🚀 Server listening at: ${port}`);
