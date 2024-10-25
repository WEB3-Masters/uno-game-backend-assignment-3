import { Room } from '../model/room';
import { Player } from '../model/player';
import { AppDataSource } from '../utils/db';

export const createGame = async (_: any, host: Player) => {
  const roomRepository = AppDataSource.getRepository(Room);
  const newRoom = roomRepository.create({ players: [host], currentHand: null, roomState: 'waiting' });
  await roomRepository.save(newRoom);
  return newRoom;
};

export const joinGame = async (_: any, { roomId, playerId }: { roomId: string; playerId: string }) => {
  const roomRepository = AppDataSource.getRepository(Room);
  const playerRepository = AppDataSource.getRepository(Player);

  const game = await roomRepository.findOneBy({ id: roomId });
  const player = await playerRepository.findOneBy({ id: playerId });

  if (game && player && game.players.length < 4) {
    game.players.push(player);
    await roomRepository.save(game);
    return game;
  }
  throw new Error('Unable to join game');
};

export const playHand = async (_: any, { gameId, nextPlayerId, cards }: { gameId: string; nextPlayerId: string; cards: string[] }) => {
  const roomRepository = AppDataSource.getRepository(Room);
  const game = await roomRepository.findOneBy({ id: gameId });

  if (game) {
    game.currentHand = { turnPlayerId: nextPlayerId, cards };
    await roomRepository.save(game);
    return game;
  }
  throw new Error('Game not found');
};
