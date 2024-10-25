import bcrypt from 'bcryptjs';
import { Player } from '../model/player';
import { AppDataSource } from '../utils/db';

export const registerPlayer = async (_: any, { username, password }: { username: string; password: string }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const playerRepository = AppDataSource.getRepository(Player);
  const newPlayer = playerRepository.create({ username, password: hashedPassword });
  await playerRepository.save(newPlayer);
  return newPlayer;
};

export const loginPlayer = async (_: any, { username, password }: { username: string; password: string }) => {
  const playerRepository = AppDataSource.getRepository(Player);
  const player = await playerRepository.findOneBy({ username });
  if (player && (await bcrypt.compare(password, player.password))) {
    return { id: player.id };
  }
  
  return { error: { message: "Invalid credetials!"}}
};
