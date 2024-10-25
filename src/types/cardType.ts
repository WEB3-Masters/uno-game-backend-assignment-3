import { GraphQLObjectType, GraphQLString, GraphQLInt } from 'graphql';

export const CardType = new GraphQLObjectType({
  name: 'Card',
  fields: {
    type: { type: GraphQLString },
    color: { type: GraphQLString },
    number: { type: GraphQLInt }
  }
});