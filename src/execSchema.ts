import { readFileSync } from 'fs';

import { Resolvers, Player, Room, RoomState, CardColor, Card, CardType } from '__generated__/schema-types';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { addMocksToSchema } from '@graphql-tools/mock';
import { AppDataSource } from "./utils/db";

import { loginPlayer, registerPlayer } from './resolvers/authResolver';
import { getPlayers, getPlayerById } from './resolvers/playerResolver';
import { getRooms, getRoomById, deleteRoom, createRoom, joinGame, playHand } from 'resolvers/roomResolver';
import {CardORM} from "./model/cardORM";

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


// Our resolvers take a generated type "Resolvers" that conforms exactly
// to the shape of our schema the last time we ran "generateFromSchema"
const resolvers: Resolvers = {
    Query: {
        players: async () => {
            const response =  await getPlayers();

            return response.map((player) : Player => {
                return {
                    id: player.id,
                    username: player.username,
                    password: player.password,
                    roomId: player.room?.id
                }
            })
        },
        player: async (_, { id }) => {
            const response = await getPlayerById(id);

            if (!response) {
                throw new Error("Player not found");
            }

            return {
                id: response.id,
                username: response.username,
                password: response.password,
                roomId: response.room?.id
            }
        },
        rooms: async () => {
            const response = await getRooms();

            return response.map((room) : Room => {
                return {
                    id: room.id,
                    players: room.players.map((player) : Player => ({
                        id: player.id,
                        username: player.username,
                        password: player.password,
                        roomId: player.room?.id
                    })),
                    roomState: room.roomState as RoomState,
                    deck: {
                        id: room.deck.id,
                        cards: room.deck.cards.map(mapCardORMtoCard)
                    },
                    discardPile: {
                        id: room.discardPile.id,
                        cards: room.discardPile.cards.map(mapCardORMtoCard)
                    },
                    hands: []
                    /*hands: room.hands.map((hand : any) => ({
                        playerId: hand.playerId,
                        cards: hand.cards.map((card : any) : Card => ({
                            id: card.id,
                            type: card.type as CardType,
                            color: card.color as CardColor,
                            number: card.number
                        }))
                    }))*/
                }
            })
        },
        room: async (_, { id }) => {
            const response = await getRoomById(id);
            if(!response) {
                throw new Error("Room not found");
            }
            return {
                id: response.id,
                players: response.players.map((player) : Player => ({
                    id: player.id,
                    username: player.username,
                    password: player.password,
                    roomId: player.room?.id
                })),
                roomState: response.roomState as RoomState,
                deck: {
                    id: response.deck.id,
                    cards: response.deck.cards.map(mapCardORMtoCard)
                },
                discardPile: {
                    id: response.discardPile.id,
                    cards: response.discardPile.cards.map(mapCardORMtoCard),
                },
                hands: [],
                /*hands: response.hands.map((hand : any) => ({
                    playerId: hand.playerId,
                    cards: hand.cards.map((card : any) : Card => ({
                        id: card.id,
                        type: card.type as CardType,
                        color: card.color as CardColor,
                        number: card.number
                    }))
                }))
                 */
            }
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
            const player = await getPlayerById(hostId.toString());
            if (!player) {
                throw new Error("Player not found");
            }
            const response = await createRoom(player);
            
            return {
                id: response.id,
                players: response.players.map((player) : Player => ({
                    id: player.id,
                    username: player.username,
                    password: player.password,
                    roomId: player.room?.id
                })),
                roomState: response.roomState as RoomState,
                deck: {
                    id: response.deck.id,
                    cards: response.deck.cards.map(mapCardORMtoCard),
                },
                discardPile: {
                    id: response.discardPile.id,
                    cards: response.discardPile.cards.map(mapCardORMtoCard),
                },
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
        },
        joinRoom: async (_, { roomId, playerId }) => {
            const response = await joinGame({ roomId, playerId });

            return {
                id: response.id,
                players: response.players.map((player) : Player => ({
                    id: player.id,
                    username: player.username,
                    password: player.password,
                    roomId: player.room?.id
                })),
                roomState: response.roomState as RoomState,
                deck: {
                    id: response.deck.id,
                    cards: response.deck.cards.map(mapCardORMtoCard),
                },
                discardPile: {
                    id: response.discardPile.id,
                    cards: response.discardPile.cards.map(mapCardORMtoCard),
                },
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
            };
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
            return {
                id: response.id,
                players: response.players.map((player) : Player => ({
                    id: player.id,
                    username: player.username,
                    password: player.password,
                    roomId: player.room?.id
                })),
                roomState: response.roomState as RoomState,
                deck: {
                    id: response.deck.id,
                    cards: Array.from(response.deck.cards).map((card) : Card => {
                        return {
                            id: card.id,
                            type: card.type as CardType,
                            color: card.color as CardColor,
                            number: card.number
                        }
                    })
                },
                discardPile: response.discardPile.map((card: any) : Card => ({  
                    id: card.id,
                    type: card.type as CardType,
                    color: card.color as CardColor,
                    number: card.number
                })),
                hands: response.hands.map((hand : any) => ({
                    playerId: hand.playerId,
                    cards: hand.cards.map((card : any) : Card => ({
                        id: card.id,
                        type: card.type as CardType,
                        color: card.color as CardColor,
                        number: card.number
                    }))
                }))
            };
        }*/
    }
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