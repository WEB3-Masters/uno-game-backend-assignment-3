import { Player } from '../model/player';
import { AppDataSource } from '../utils/db';

export const getPlayers = async () => {
    const playerRepository = AppDataSource.getRepository(Player);
    return await playerRepository.find();
};