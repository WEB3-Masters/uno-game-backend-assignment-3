import { RoomORM } from '../model/roomORM';
import { PlayerORM } from '../model/playerORM';
import { AppDataSource } from '../utils/db';
import { CardORM } from 'model/cardORM';
import { pubsub, EVENTS } from '../utils/pubsub';

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

export const playHand = async ({ roomId, playerId, cardId } : { roomId: string; playerId: string; cardId: string }) => {
  const roomRepository = AppDataSource.getRepository(RoomORM);
  const playerRepository = AppDataSource.getRepository(PlayerORM);
  const cardRepository = AppDataSource.getRepository(CardORM);

  // Fetch the room, player, and card from the database
  const room = await roomRepository.findOne({ where: { id: roomId }, relations: ['players', 'deck', 'deck.cards'] });
  const player = await playerRepository.findOne({ where: { id: playerId }, relations: ['room'] });
  const card = await cardRepository.findOne({ where: { id: cardId }, relations: ['deck', 'deck.room'] });

  if (!room || !player || !card) {
    throw new Error('Room, player, or card not found');
  }

  // Validate that the player is part of the room
  if (!player.room || player.room.id !== room.id) {
    throw new Error('Player is not part of the room');
  }

  // Validate that the card is part of the room's deck
  if (!card.deck || card.deck.room.id !== room.id) {
    throw new Error('Card is not part of the room\'s deck');
  }

  if(room?.discardPile) {
    // Update the room state (e.g., move the card to the discard pile)
    room.discardPile.cards.push(card);
  }
  //TODO: what if there is no discart pile?

  if(room?.deck) {
    room.deck.cards = room.deck.cards.filter(c => c.id !== card.id);
  }
  //TODO: what if there is not deck?

  // Save the updated state back to the database
  await roomRepository.save(room);

  // Publish event when a card is played
  pubsub.publish(`${EVENTS.ROOM_UPDATED}.${roomId}`, { 
    roomUpdated: room,
    roomId: roomId 
  });

  return true;
}