import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';

import typeDefs from './schema/typeDefs.js';
import resolvers from './resolvers/index.js';
import { getUser } from './utils/auth.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Create PubSub instance for subscriptions
export const pubsub = new PubSub();

// Create executable schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create Apollo Server
const server = new ApolloServer({
  schema,
  context: async ({ req }) => {
    // Get the user token from the headers
    const token = req?.headers?.authorization || '';
    
    // Try to retrieve a user with the token
    const user = await getUser(token);
    
    return { user, pubsub };
  },
});

// Create WebSocket server
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

// Use WebSocket server
useServer(
  { 
    schema,
    context: async (ctx) => {
      // Add subscription context here if needed
      return { pubsub };
    },
  }, 
  wsServer
);

await server.start();
server.applyMiddleware({ app });

const PORT = process.env.PORT || 4000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(
        `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
      );
      console.log(
        `🚀 Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}`
      );
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  }); 