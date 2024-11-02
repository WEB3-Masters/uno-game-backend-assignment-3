import { readFileSync } from 'fs';

import { Resolvers, Player, Room, RoomState, CardColor, Card, CardType } from '__generated__/schema-types';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { addMocksToSchema } from '@graphql-tools/mock';
import { AppDataSource } from "./utils/db";

import { loginPlayer, registerPlayer } from './resolvers/authResolver';
import { getPlayers, getPlayerById } from './resolvers/playerResolver';
import { getRooms, getRoomById, deleteRoom, createRoom, joinRoom, playHand } from 'resolvers/roomResolver';
import {CardORM} from "./model/cardORM";
import { pubsub, EVENTS } from './utils/pubsub';
import { RoomORM } from 'model/roomORM';
import { PlayerORM } from 'model/playerORM';

// Interface we pass as argument in our resolvers so they can access data from our database
export interface MyContext {
    dataSource: typeof AppDataSource
}

// Read definitions of data types in our GraphQL schema
const typeDefs = readFileSync('./src/schemas/schema.graphql', { encoding: 'utf-8' });

const mapCardORMtoCard = (card: CardORM) : Card => {
    return ({
        id: card.id,
        type: card.type as CardType,
        color: card.color as CardColor,
        number: card.number
    })
}

const mapRoom = (response: RoomORM): Room => {
    return {
        id: response.id,
        players: response.players.map((player: PlayerORM) : Player => ({
            id: player.id,
            username: player.username,
            password: player.password,
            roomId: player.room?.id
        })),
        roomState: response.roomState as RoomState,
        deck: response.deck ? {
            id: response.deck.id,
            cards: response.deck.cards.map(mapCardORMtoCard),
        } : null,
        discardPile: response.discardPile ? {
            id: response.discardPile.id,
            cards: response.discardPile.cards.map(mapCardORMtoCard),
        } : null,
        hands: []
        /*hands: response.hands.map((hand : any) => ({
            playerId: hand.playerId,
            cards: hand.cards.map((card : any) : Card => ({
                id: card.id,
                type: card.type as CardType,
                color: card.color as CardColor,
                number: card.number
            }))
        }))*/
    }
}

const mapPlayer = (response: PlayerORM): Player => {
    return {
        id: response.id,
        username: response.username,
        password: response.password,
        roomId: response.room?.id
    }
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

            console.log('Room', response);
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
            return await registerPlayer({ username, password });
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
        /*playHand: async (parent, { roomId, playerId, cardId }, contextValue: MyContext, info) => {
            const success = await playHand({ roomId, playerId, cardId });
            if (!success) {
                throw new Error("Failed to play hand");
            }
            const response = await getRoomById(roomId);
            if (!response) {
                throw new Error("Room not found");
            }
            return mapRoom(response);
        }*/
    },
    Subscription: {
        roomUpdated: {
            subscribe: (_: any, { roomId }: { roomId: string }): AsyncIterator<any, any, undefined> => {
                return pubsub.asyncIterator([`${EVENTS.ROOM_UPDATED}.${roomId}`]);
            },
            resolve: (payload: { roomUpdated: Room }): Room => {
                return payload.roomUpdated;
            }
        }
    }
}

// A executable schema object that we pass directly to Apollo Server
const schema = makeExecutableSchema({
    typeDefs: [ typeDefs ],
    resolvers: { ...resolvers },
})

// Export an executableSchema that gathers data from the database
export const execSchema = schema;

// Export an executableSchema populated with mocked/dummy data
export const mockedExecSchema = addMocksToSchema({
    schema,
})