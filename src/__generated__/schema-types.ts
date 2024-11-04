import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  UUID: { input: string; output: string; }
};

export type Card = {
  __typename?: 'Card';
  color?: Maybe<CardColor>;
  deck?: Maybe<Deck>;
  id: Scalars['UUID']['output'];
  number?: Maybe<Scalars['Int']['output']>;
  type: CardType;
};

export enum CardColor {
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  RED = 'RED',
  YELLOW = 'YELLOW'
}

export type CardInput = {
  color?: InputMaybe<CardColor>;
  id: Scalars['UUID']['input'];
  number?: InputMaybe<Scalars['Int']['input']>;
  type: CardType;
};

export enum CardType {
  DRAW = 'DRAW',
  NUMBERED = 'NUMBERED',
  REVERSE = 'REVERSE',
  SKIP = 'SKIP',
  WILD = 'WILD',
  WILD_DRAW = 'WILD_DRAW'
}

export type Deck = {
  __typename?: 'Deck';
  cards: Array<Card>;
  id: Scalars['UUID']['output'];
};

export type DeckInput = {
  cards: Array<CardInput>;
  id: Scalars['UUID']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createRoom: Room;
  deleteRoom?: Maybe<Scalars['Boolean']['output']>;
  joinRoom: Room;
  loginPlayer?: Maybe<Scalars['String']['output']>;
  registerPlayer: Player;
  updateRoom: Room;
};


export type MutationCreateRoomArgs = {
  hostId: Scalars['UUID']['input'];
};


export type MutationDeleteRoomArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationJoinRoomArgs = {
  playerId: Scalars['UUID']['input'];
  roomId: Scalars['UUID']['input'];
};


export type MutationLoginPlayerArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationRegisterPlayerArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationUpdateRoomArgs = {
  room: RoomInput;
};

export type Player = {
  __typename?: 'Player';
  cards?: Maybe<Array<Card>>;
  id: Scalars['UUID']['output'];
  password: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type PlayerInput = {
  cards?: InputMaybe<Array<CardInput>>;
  id: Scalars['UUID']['input'];
};

export type Query = {
  __typename?: 'Query';
  player?: Maybe<Player>;
  players: Array<Player>;
  room?: Maybe<Room>;
  rooms: Array<Room>;
};


export type QueryPlayerArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryRoomArgs = {
  id: Scalars['UUID']['input'];
};

export type Room = {
  __typename?: 'Room';
  currentPlayer?: Maybe<Player>;
  deck?: Maybe<Deck>;
  discardPile?: Maybe<Deck>;
  id: Scalars['UUID']['output'];
  players?: Maybe<Array<Player>>;
  roomState?: Maybe<RoomState>;
};

export type RoomInput = {
  currentPlayer?: InputMaybe<PlayerInput>;
  deck?: InputMaybe<DeckInput>;
  discardPile?: InputMaybe<DeckInput>;
  id: Scalars['UUID']['input'];
  players?: InputMaybe<Array<PlayerInput>>;
  roomState?: InputMaybe<RoomState>;
};

export enum RoomState {
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING = 'WAITING'
}

export type Subscription = {
  __typename?: 'Subscription';
  roomUpdated: Room;
};


export type SubscriptionRoomUpdatedArgs = {
  roomId: Scalars['UUID']['input'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Card: ResolverTypeWrapper<Card>;
  CardColor: CardColor;
  CardInput: CardInput;
  CardType: CardType;
  Deck: ResolverTypeWrapper<Deck>;
  DeckInput: DeckInput;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Player: ResolverTypeWrapper<Player>;
  PlayerInput: PlayerInput;
  Query: ResolverTypeWrapper<{}>;
  Room: ResolverTypeWrapper<Room>;
  RoomInput: RoomInput;
  RoomState: RoomState;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscription: ResolverTypeWrapper<{}>;
  UUID: ResolverTypeWrapper<Scalars['UUID']['output']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  Card: Card;
  CardInput: CardInput;
  Deck: Deck;
  DeckInput: DeckInput;
  Int: Scalars['Int']['output'];
  Mutation: {};
  Player: Player;
  PlayerInput: PlayerInput;
  Query: {};
  Room: Room;
  RoomInput: RoomInput;
  String: Scalars['String']['output'];
  Subscription: {};
  UUID: Scalars['UUID']['output'];
};

export type CardResolvers<ContextType = any, ParentType extends ResolversParentTypes['Card'] = ResolversParentTypes['Card']> = {
  color?: Resolver<Maybe<ResolversTypes['CardColor']>, ParentType, ContextType>;
  deck?: Resolver<Maybe<ResolversTypes['Deck']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['UUID'], ParentType, ContextType>;
  number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['CardType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeckResolvers<ContextType = any, ParentType extends ResolversParentTypes['Deck'] = ResolversParentTypes['Deck']> = {
  cards?: Resolver<Array<ResolversTypes['Card']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['UUID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createRoom?: Resolver<ResolversTypes['Room'], ParentType, ContextType, RequireFields<MutationCreateRoomArgs, 'hostId'>>;
  deleteRoom?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationDeleteRoomArgs, 'id'>>;
  joinRoom?: Resolver<ResolversTypes['Room'], ParentType, ContextType, RequireFields<MutationJoinRoomArgs, 'playerId' | 'roomId'>>;
  loginPlayer?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationLoginPlayerArgs, 'password' | 'username'>>;
  registerPlayer?: Resolver<ResolversTypes['Player'], ParentType, ContextType, RequireFields<MutationRegisterPlayerArgs, 'password' | 'username'>>;
  updateRoom?: Resolver<ResolversTypes['Room'], ParentType, ContextType, RequireFields<MutationUpdateRoomArgs, 'room'>>;
};

export type PlayerResolvers<ContextType = any, ParentType extends ResolversParentTypes['Player'] = ResolversParentTypes['Player']> = {
  cards?: Resolver<Maybe<Array<ResolversTypes['Card']>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['UUID'], ParentType, ContextType>;
  password?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  player?: Resolver<Maybe<ResolversTypes['Player']>, ParentType, ContextType, RequireFields<QueryPlayerArgs, 'id'>>;
  players?: Resolver<Array<ResolversTypes['Player']>, ParentType, ContextType>;
  room?: Resolver<Maybe<ResolversTypes['Room']>, ParentType, ContextType, RequireFields<QueryRoomArgs, 'id'>>;
  rooms?: Resolver<Array<ResolversTypes['Room']>, ParentType, ContextType>;
};

export type RoomResolvers<ContextType = any, ParentType extends ResolversParentTypes['Room'] = ResolversParentTypes['Room']> = {
  currentPlayer?: Resolver<Maybe<ResolversTypes['Player']>, ParentType, ContextType>;
  deck?: Resolver<Maybe<ResolversTypes['Deck']>, ParentType, ContextType>;
  discardPile?: Resolver<Maybe<ResolversTypes['Deck']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['UUID'], ParentType, ContextType>;
  players?: Resolver<Maybe<Array<ResolversTypes['Player']>>, ParentType, ContextType>;
  roomState?: Resolver<Maybe<ResolversTypes['RoomState']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  roomUpdated?: SubscriptionResolver<ResolversTypes['Room'], "roomUpdated", ParentType, ContextType, RequireFields<SubscriptionRoomUpdatedArgs, 'roomId'>>;
};

export interface UuidScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['UUID'], any> {
  name: 'UUID';
}

export type Resolvers<ContextType = any> = {
  Card?: CardResolvers<ContextType>;
  Deck?: DeckResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Player?: PlayerResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Room?: RoomResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  UUID?: GraphQLScalarType;
};

