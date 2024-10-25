import { readFileSync } from 'fs';

import { Resolvers, Player} from '__generated__/schema-types';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { addMocksToSchema } from '@graphql-tools/mock';
import { AppDataSource } from "./utils/db"

import { loginPlayer } from './resolvers/authResolver';
import {getPlayers} from './resolvers/playerResolver'

// Interface we pass as argument in our resolvers so they can access data from our database
export interface MyContext {
    dataSource: typeof AppDataSource
}

// Read definitions of data types in our GraphQL schema
const typeDefs = readFileSync('./schema.graphql', { encoding: 'utf-8' });


// Our resolvers take a generated type "Resolvers" that conforms exactly
// to the shape of our schema the last time we ran "generateFromSchema"
const resolvers: Resolvers = {
    Query: {
        players: async (parent, args, contextValue: MyContext, info) => {
            const response =  await getPlayers();

            return response.map((player) : Player => {
                return {
                    id: player.id,
                    username: player.username,
                    password: player.password,
                    roomId: player.room?.id
                }
            })
        }

        //TODO: Implement resolvers for our queries
    },
    Mutation: {
        loginPlayer: async (parent, { username, password }, contextValue: MyContext, info) => {
            const response = await loginPlayer({username, password});

            if (response.error) {
                throw new Error(response.error.message);
            }

            return response.id;
        },

        //TODO: Implement resolvers for our mutations
    },

    //TODO: Figure out how to implement resolvers for our custom scalars
}

// A executable schema object that we pass directly to Apollo Server
const schema = makeExecutableSchema({
    typeDefs: [
        // alongside our schema type definitions
        typeDefs
    ],
    resolvers: {
        // Pass in our custom scalar resolvers
        // alongside our schema resolvers
        ...resolvers,
    },
})

// Export an executableSchema that gathers data from the database
export const execSchema = schema;

// Export an executableSchema populated with mocked/dummy data
export const mockedExecSchema = addMocksToSchema({
    schema,
})