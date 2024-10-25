import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { schema } from './schemas/schema';
import { AppDataSource } from './utils/db';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

async function startServer() {
  await AppDataSource.initialize();
  const apolloServer = new ApolloServer({ schema });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}${apolloServer.graphqlPath}`);
  });
}

startServer().catch((error) => console.error('Error starting server:', error));
