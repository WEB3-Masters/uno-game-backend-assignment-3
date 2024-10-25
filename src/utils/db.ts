import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Room } from '../model/room';
import { Player } from '../model/player';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './uno_game.db',
  entities: [Room, Player],
  synchronize: true,
});
