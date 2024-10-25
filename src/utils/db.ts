import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { RoomORM } from '../model/roomORM';
import { PlayerORM } from '../model/playerORM';
import { DeckORM } from '../model/deckORM';
import { CardORM } from '../model/cardORM';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './uno_game.db',
  entities: [DeckORM, CardORM, RoomORM, PlayerORM],
  synchronize: true,
});
