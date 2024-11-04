import { RoomORM } from '../model/roomORM';
import { PlayerORM } from '../model/playerORM';
import { AppDataSource } from '../utils/db';
import { pubsub, EVENTS } from '../utils/pubsub';
import { mapDeckInputToDeckORM, mapPlayerInputToPlayerORM } from 'utils/mapper';
import { RoomInput } from '__generated__/schema-types';

export const createRoom = async (host: PlayerORM) => {
  const roomRepository = AppDataSource.getRepository(RoomORM);
  const newRoom = roomRepository.create(new RoomORM([host]));
  await roomRepository.save(newRoom);
  return newRoom;
};

export const joinRoom = async ({ roomId, playerId } : { roomId: string; playerId: string }) => {
  const roomRepository = AppDataSource.getRepository(RoomORM);
  const playerRepository = AppDataSource.getRepository(PlayerORM);

  const room = await roomRepository.findOne({ where: { id: roomId }, relations: ['players'] });
  const player = await playerRepository.findOneBy({ id: playerId });

  if (room && player && room.players.length < 4) {
    room.players.push(player);
    await roomRepository.save(room);
    

    pubsub.publish(`${EVENTS.ROOM_UPDATED}.${roomId}`, { 
      roomUpdated: room,
      roomId: roomId 
    });
    
    return room;
  }
  throw new Error('Unable to join room');
};

export const getRooms = async () => {
  const roomRepository = AppDataSource.getRepository(RoomORM);
  return await roomRepository.find();
}

export const getRoomById = async (roomId: string) => {
  const roomRepository = AppDataSource.getRepository(RoomORM);
  return await roomRepository.findOne({
    where: { id: roomId },
    relations: ['players']
  });
}

export const deleteRoom = async (id: string) => {
  const roomRepository = AppDataSource.getRepository(RoomORM);
  const room = await roomRepository.findOneBy({ id });
  if (!room) throw new Error("Room not found");

  await roomRepository.remove(room);
  return true;
}

export const updateRoom = async (updatedRoom: RoomInput) => {
  const roomRepository = AppDataSource.getRepository(RoomORM);
  const currentRoom = await roomRepository.findOneBy({ id: updatedRoom.id });
  if (!currentRoom) throw new Error("Room not found");

  updateRoomProperties(currentRoom, updatedRoom);
  return await roomRepository.save(currentRoom);
};

const updateRoomProperties = (currentRoom: RoomORM, updatedRoom: RoomInput) => {
  if (updatedRoom.roomState) {
    currentRoom.roomState = updatedRoom.roomState;
  }
  if (updatedRoom.deck) {
    currentRoom.deck = mapDeckInputToDeckORM(updatedRoom.deck, currentRoom);
  }
  if (updatedRoom.discardPile) {
    currentRoom.discardPile = mapDeckInputToDeckORM(updatedRoom.discardPile, currentRoom);
  }
  if (updatedRoom.players) {
    currentRoom.players = updatedRoom.players.map(player => mapPlayerInputToPlayerORM(player, currentRoom));
  }
};