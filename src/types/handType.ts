import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLBoolean, GraphQLNonNull } from 'graphql';
import { CardType } from "./cardType"

export const HandType = new GraphQLObjectType({
    name: 'Hand',
    fields: {
      playerInTurn: { type: GraphQLInt },
      isReverse: { type: GraphQLBoolean },
      discardPile: { type: new GraphQLList(CardType) },
      drawPileSize: { type: GraphQLInt },
      players: { type: new GraphQLList(GraphQLString) }
    }
  });