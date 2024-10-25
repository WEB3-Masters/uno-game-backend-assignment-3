import { GraphQLObjectType, GraphQLString } from 'graphql';

export const PlayerType = new GraphQLObjectType({
    name: 'Player',
    fields: {
        username: { type: GraphQLString },
        password: { type: GraphQLString }
    }
});