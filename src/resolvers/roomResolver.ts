import { RoomORM } from '../model/roomORM';
import { PlayerORM } from '../model/playerORM';
import { AppDataSource } from '../utils/db';

export const createRoom = async (_: any, host: PlayerORM) => {
  const roomRepository = AppDataSource.getRepository(RoomORM);
  const newRoom = roomRepository.create({ players: [host], roomState: 'waiting',  });
  await roomRepository.save(newRoom);
  return newRoom;
};

export const joinGame = async (_: any, { roomId, playerId }: { roomId: string; playerId: string }) => {
  const roomRepository = AppDataSource.getRepository(RoomORM);
  const playerRepository = AppDataSource.getRepository(PlayerORM);

  const game = await roomRepository.findOneBy({ id: roomId });
  const player = await playerRepository.findOneBy({ id: playerId });

  if (game && player && game.players.length < 4) {
    game.players.push(player);
    await roomRepository.save(game);
    return game;
  }
  throw new Error('Unable to join game');
};

