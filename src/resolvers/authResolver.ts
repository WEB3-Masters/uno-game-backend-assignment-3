import bcrypt from 'bcryptjs';
import { PlayerORM } from '../model/playerORM';
import { AppDataSource } from '../utils/db';

export const registerPlayer = async ({ username, password }: { username: string; password: string }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const playerRepository = AppDataSource.getRepository(PlayerORM);
  const newPlayer = playerRepository.create(new PlayerORM(username, hashedPassword));
  await playerRepository.save(newPlayer);
  return newPlayer;
};

export const loginPlayer = async ({ username, password }: { username: string; password: string }) => {
  const playerRepository = AppDataSource.getRepository(PlayerORM);
  const player = await playerRepository.findOneBy({ username });
  if (player && (await bcrypt.compare(password, player.password))) {
    return { player};
  }
  
  return { error: { message: "Invalid credentials!"}}
};
