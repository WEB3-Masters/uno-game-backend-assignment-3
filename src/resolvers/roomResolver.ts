import { RoomORM } from '../model/roomORM';
import { PlayerORM } from '../model/playerORM';
import { AppDataSource } from '../utils/db';
import { pubsub, EVENTS } from '../utils/pubsub';
import { mapDeckInputToDeckORM, mapPlayerInputToPlayerORM } from 'utils/mapper';
import { RoomInput } from '__generated__/schema-types';
import { CardColor, CardORM, CardType } from 'model/cardORM';
import { InitialGameInput } from '__generated__/schema-types';
import { DeckORM } from '../model/deckORM';

export const createRoom = async (host: PlayerORM) => {
  const roomRepository = AppDataSource.getRepository(RoomORM);
  const playerRepository = AppDataSource.getRepository(PlayerORM);

  const newRoom = roomRepository.create(new RoomORM([host]));
  newRoom.currentPlayer = host;

  await roomRepository.save(newRoom);

  host.room = newRoom;
  await playerRepository.update(host.id, { room: newRoom });

  return newRoom;
};

export const joinRoom = async ({ roomId, playerId } : { roomId: string; playerId: string }) => {
  const roomRepository = AppDataSource.getRepository(RoomORM);
  const playerRepository = AppDataSource.getRepository(PlayerORM);

  const room = await roomRepository.findOne({ where: { id: roomId }, relations: ['players'] });
  const player = await playerRepository.findOneBy({ id: playerId });

  if(player?.room) {
    throw new Error("Player already in a room");
  }

  if(!room) {
    throw new Error("Room not found");
  }

  if (room && player && room.players.length < 4) {
    room.players.push(player);
    await roomRepository.save(room);

    player.room = room;
    await playerRepository.save(player);

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
  return await roomRepository.find({ relations: ['players'] });
}

export const getRoomById = async (roomId: string) => {
  const roomRepository = AppDataSource.getRepository(RoomORM);
  return await roomRepository.findOne({
    where: { id: roomId },
    relations: ['players']
  });
}

export const deleteRoom = async (roomId: string) => {
  const roomRepository = AppDataSource.getRepository(RoomORM);
  const room = await roomRepository.findOne({
    where: { id: roomId },
    relations: ['players', 'players.cards']
  });
  if (!room) throw new Error("Room not found");

  // Start a transaction to ensure all operations complete or none do
  await AppDataSource.transaction(async transactionalEntityManager => {
    // First remove all cards
    if (room.players) {
      for (const player of room.players) {
        if (player.cards && player.cards.length > 0) {
          await transactionalEntityManager
            .createQueryBuilder()
            .delete()
            .from(CardORM)
            .where("playerId = :playerId", { playerId: player.id })
            .execute();
        }
      }
    }

    // Then update all players to remove room reference
    await transactionalEntityManager
      .createQueryBuilder()
      .update(PlayerORM)
      .set({ room: null })
      .where("roomId = :roomId", { roomId })
      .execute();

    // Finally delete the room
    await transactionalEntityManager
      .createQueryBuilder()
      .delete()
      .from(RoomORM)
      .where("id = :id", { id: roomId })
      .execute();
  });

  pubsub.publish(`${EVENTS.ROOM_UPDATED}.${roomId}`, { 
    roomUpdated: null,
    roomId: roomId 
  });
  
  return true;
}

export const updateRoom = async (updatedRoom: RoomInput) => {
  const roomRepository = AppDataSource.getRepository(RoomORM);
  const currentRoom = await roomRepository.findOne({
    where: { id: updatedRoom.id },
    relations: ['players', 'players.cards', 'deck', 'discardPile']
  });

  if (!currentRoom) throw new Error("Room not found");
  
  // Update the room properties
  const newRoom = updateRoomProperties(currentRoom, updatedRoom);
  
  // Save the entire entity instead of using update
  const savedRoom = await roomRepository.save(newRoom);

  pubsub.publish(`${EVENTS.ROOM_UPDATED}.${updatedRoom.id}`, {
    roomUpdated: savedRoom,
    roomId: updatedRoom.id
  });

  return savedRoom;
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
    currentRoom.players = updatedRoom.players.map(player => 
      mapPlayerInputToPlayerORM(player, currentRoom)
    );
  }
  if(updatedRoom.currentPlayer) {
    currentRoom.currentPlayer = mapPlayerInputToPlayerORM(updatedRoom.currentPlayer, currentRoom);
  }

  return currentRoom;
};

export const initializeGame = async (gameInput: InitialGameInput) => {
  const roomRepository = AppDataSource.getRepository(RoomORM);

  const room = await roomRepository.findOne({
    where: { id: gameInput.roomId },
    relations: ['players']
  });

  if (!room) throw new Error("Room not found");

  // Start a transaction to ensure all operations complete or none do
  return await AppDataSource.transaction(async transactionalEntityManager => {
    // Create main deck
    const deckCards = gameInput.deckCards.map(card => {
      const cardOrm = new CardORM(card.type as CardType, card.color as CardColor, card.number ?? undefined);
      return cardOrm;
    });
    const deck = new DeckORM(undefined, deckCards, room);
    await transactionalEntityManager.save(deck);
    room.deck = deck;

    // Create discard pile
    const pileCards = gameInput.pileCards.map(card => {
      const cardOrm = new CardORM(card.type as CardType, card.color as CardColor, card.number ?? undefined);
      return cardOrm;
    });
    const discardPile = new DeckORM(undefined, pileCards, room);
    await transactionalEntityManager.save(discardPile);
    room.discardPile = discardPile;

    // Assign cards to players
    for (const playerCards of gameInput.playerCards) {
      const player = room.players.find(p => p.id === playerCards.playerId);
      if (!player) continue;

      const cards = playerCards.cards.map(card => {
        const cardOrm = new CardORM(card.type as CardType, card.color as CardColor, card.number ?? undefined);
        cardOrm.player = player;
        return cardOrm;
      });
      
      await transactionalEntityManager.save(cards);
      player.cards = cards;
      await transactionalEntityManager.save(player);
    }

    // Set room state and current player
    room.roomState = gameInput.roomState;
    if (gameInput.currentPlayerId) {
      const currentPlayer = room.players.find(p => p.id === gameInput.currentPlayerId);
      if (currentPlayer) {
        room.currentPlayer = currentPlayer;
      }
    }

    const savedRoom = await transactionalEntityManager.save(room);

    // Publish room update
    pubsub.publish(`${EVENTS.ROOM_UPDATED}.${room.id}`, {
      roomUpdated: savedRoom,
      roomId: room.id
    });

    return savedRoom;
  });
};