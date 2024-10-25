import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInt, GraphQLList } from 'graphql';
import { GameType } from '../types/gameType';
import { PlayerType } from '../types/playerType';  
import { registerPlayer, loginPlayer } from '../resolvers/authResolver';
import { createGame, joinGame, playHand } from '../resolvers/roomResolver';
import { getPlayers } from '../resolvers/playerResolver';

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    players: { type: new GraphQLList(PlayerType), resolve: getPlayers },
  },
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    registerPlayer: {
      type: PlayerType,
      args: { username: { type: GraphQLString }, password: { type: GraphQLString } },
      resolve: registerPlayer,
    },
    loginPlayer: {
      type: GraphQLString,
      args: { username: { type: GraphQLString }, password: { type: GraphQLString } },
      resolve: loginPlayer,
    },
    createGame: {
      type: GameType,
      args: { hostId: { type: GraphQLInt } },
      resolve: createGame,
    },
    joinGame: {
      type: GameType,
      args: { gameId: { type: GraphQLInt }, playerId: { type: GraphQLInt } },
      resolve: joinGame,
    },
    playHand: {
      type: GameType,
      args: { gameId: { type: GraphQLInt }, nextPlayerId: { type: GraphQLInt }, cards: { type: new GraphQLList(GraphQLString) } },
      resolve: playHand,
    },
  },
});

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
