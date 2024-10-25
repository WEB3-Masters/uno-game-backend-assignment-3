import { GraphQLObjectType, GraphQLInt, GraphQLList } from 'graphql';
import { HandType } from './handType';

export const GameType = new GraphQLObjectType({
  name: 'Game',
  fields: {
    targetScore: { type: GraphQLInt },
    hand: { type: HandType },
    playerScores: { type: new GraphQLList(GraphQLInt) },
    winner: { type: GraphQLInt },
    playerCount: { type: GraphQLInt }
  }
});
