import { PlayerORM } from '../model/playerORM';
import { AppDataSource } from '../utils/db';

export const getPlayers = async () => {
    const playerRepository = AppDataSource.getRepository(PlayerORM);
    return await playerRepository.find();
};

export const getPlayerById = async (id: string) => {
    const playerRepository = AppDataSource.getRepository(PlayerORM);
    return await playerRepository.findOneBy({ id });
};