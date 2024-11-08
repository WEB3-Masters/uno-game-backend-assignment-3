import { readFileSync } from 'fs';
import { Resolvers, Room } from '__generated__/schema-types';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { addMocksToSchema } from '@graphql-tools/mock';
import { AppDataSource } from "./utils/db";
import { loginPlayer, registerPlayer } from './resolvers/authResolver';
import { getPlayers, getPlayerById } from './resolvers/playerResolver';
import { getRooms, getRoomById, deleteRoom, createRoom, joinRoom, updateRoom } from 'resolvers/roomResolver';
import { pubsub, EVENTS } from './utils/pubsub';
import { mapPlayer, mapRoom } from 'utils/mapper';

// Interface we pass as argument in our resolvers so they can access data from our database
export interface MyContext {
    dataSource: typeof AppDataSource
}

// Our resolvers take a generated type "Resolvers" that conforms exactly
// to the shape of our schema the last time we ran "generateFromSchema"
const resolvers: Resolvers = {
    Query: {
        players: async () => {
            const response = await getPlayers();
            return response.map(mapPlayer);
        },
        player: async (_, { id }) => {
            const response = await getPlayerById(id);

            if (!response) {
                throw new Error("Player not found");
            }

            return mapPlayer(response);
        },
        rooms: async () => {
            const response = await getRooms();
            return response.map(mapRoom);
        },
        room: async (_, { id }) => {
            const response = await getRoomById(id);
            if(!response) {
                throw new Error("Room not found");
            }

            return mapRoom(response);
        }
    },
    Mutation: {
        loginPlayer: async (_, { username, password }) => {
            const response = await loginPlayer({username, password});

            if (response.error) {
                throw new Error(response.error.message);
            }

            return response.id;
        },
        registerPlayer: async(_, { username, password }) => {
            const response = await registerPlayer({ username, password });
            return mapPlayer(response);
        },
        createRoom: async (_, { hostId }, ) => {
            const player = await getPlayerById(hostId);
            if (!player) {
                throw new Error("Player not found");
            }
            const response = await createRoom(player);
            
            return mapRoom(response);
        },
        joinRoom: async (_, { roomId, playerId }) => {
            const response = await joinRoom({ roomId, playerId });
            return mapRoom(response);
        },
        deleteRoom: async (_, { id }) => {
            return await deleteRoom(id);
        },
        updateRoom: async (_, { room }) => {
            const response = await updateRoom(room);
            return mapRoom(response);
        },
    },
    Subscription: {
        roomUpdated: {
            subscribe: async (_: any, { roomId }: { roomId: string }): Promise<AsyncIterable<any>> => {
                return { [Symbol.asyncIterator]: () => pubsub.asyncIterator([`${EVENTS.ROOM_UPDATED}.${roomId}`]) };
            },
            resolve: (payload: { roomUpdated: Room }): Room => {
                return payload.roomUpdated;
            }
        }
    }
}

// Read definitions of data types in our GraphQL schema
const typeDefs = readFileSync('./src/schemas/schema.graphql', { encoding: 'utf-8' });

// A executable schema object that we pass directly to Apollo Server
export const execSchema = makeExecutableSchema({
    typeDefs: [ typeDefs ],
    resolvers: { ...resolvers },
})

// Export an executableSchema populated with mocked/dummy data
export const mockedExecSchema = addMocksToSchema({
    schema: execSchema,
})
