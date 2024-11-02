import { PubSub } from 'graphql-subscriptions';

export const pubsub = new PubSub();

export const EVENTS = {
  ROOM_UPDATED: 'ROOM_UPDATED',
} as const; 