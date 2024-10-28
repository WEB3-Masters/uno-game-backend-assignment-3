import { readFileSync } from 'fs';

import { Resolvers, Player, Room, RoomState, CardColor, Card, CardType } from '__generated__/schema-types';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { addMocksToSchema } from '@graphql-tools/mock';
import { AppDataSource } from "./utils/db";

import { loginPlayer, registerPlayer } from './resolvers/authResolver';
import { getPlayers, getPlayerById } from './resolvers/playerResolver';
import { getRooms, getRoomById, deleteRoom, createRoom, joinGame, playHand } from 'resolvers/roomResolver';

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
        },

        player: async (parent, { id }, contextValue: MyContext, info) => {
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

        rooms: async (parent, args, contextValue: MyContext, info) => {
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
                        cards: Array.from(room.deck.cards).map((card) : Card => {
                            return {
                                id: card.id,
                                type: card.type as CardType,
                                color: card.color as CardColor,
                                number: card.number
                            }
                        })
                    },
                    discardPile: room.discardPile.map((card: any) : Card => ({  
                        id: card.id,
                        type: card.type as CardType,
                        color: card.color as CardColor,
                        number: card.number
                    })),
                    hands: room.hands.map((hand : any) => ({
                        playerId: hand.playerId,
                        cards: hand.cards.map((card : any) : Card => ({
                            id: card.id,
                            type: card.type as CardType,
                            color: card.color as CardColor,
                            number: card.number
                        }))
                    }))
                }
            })
        },

        room: async (parent, { id }, contextValue: MyContext, info) => {
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
            }
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

        registerPlayer: async(parent, { username, password }, contextValue: MyContext, info) => {
            return await registerPlayer({ username, password });
        },

        createRoom: async (parent, { hostId }, contextValue: MyContext, info) => {
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
            }
        },

        joinRoom: async (parent, { roomId, playerId }, contextValue: MyContext, info) => {
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
        },

        deleteRoom: async (parent, { id }, contextValue: MyContext, info) => {
            return await deleteRoom(id);
        },

        playHand: async (parent, { roomId, playerId, cardId }, contextValue: MyContext, info) => {
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
        }
    }
        //TODO: Implement resolvers for our mutations
}

    //TODO: Figure out how to implement resolvers for our custom scalars

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