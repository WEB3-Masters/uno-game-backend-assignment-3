import { Card, CardColor, CardType, Player, Room, RoomState, DeckInput, CardInput, RoomInput, PlayerInput } from "__generated__/schema-types"
import { CardORM } from "model/cardORM"
import { DeckORM } from "model/deckORM"
import { PlayerORM } from "model/playerORM"
import { RoomORM } from "model/roomORM"

export const mapCard = (card: CardORM) : Card => {
    return ({
        id: card.id,
        type: card.type as CardType,
        color: card.color as CardColor,
        number: card.number
    })
}

export const mapRoom = (response: RoomORM): Room => {
    return {
        id: response.id,
        roomState: response.roomState as RoomState,
        deck: response.deck ? {
            id: response.deck.id,
            cards: response.deck.cards.map(mapCard),
        } : undefined,
        discardPile: response.discardPile ? {
            id: response.discardPile.id,
            cards: response.discardPile.cards.map(mapCard),
        } : undefined,
        players: response.players.map(mapPlayer),
    }
}

export const mapPlayer = (response: PlayerORM): Player => {
    return {
        id: response.id,
        username: response.username,
        password: response.password,
        cards: response.cards?.map(mapCard) || []
    }
}

export const mapCardInputToCardORM = (card: CardInput, currentRoom: RoomORM) : CardORM => {
    return {
        id: card.id,
        type: card.type as "SKIP" | "NUMBERED" | "REVERSE" | "DRAW" | "WILD" | "WILD DRAW",
        color: card.color as CardColor,
        number: card.number ?? undefined,
        deck: currentRoom.deck
    }
}

export const mapPlayerInputToPlayerORM = (player: PlayerInput, currentRoom: RoomORM) : PlayerORM => {
    const existingPlayer = currentRoom.players.find(p => p.id === player.id);
    if (!existingPlayer) {
        throw new Error(`Player with id ${player.id} not found in the current room.`);
    }

    return {
        id: player.id,
        username: existingPlayer.username,
        password: existingPlayer.password,
        cards: player.cards?.map(card => mapCardInputToCardORM(card, currentRoom)) || [],
        room: currentRoom
    }
}

export const mapDeckInputToDeckORM = (deck: DeckInput, currentRoom: RoomORM) : DeckORM => {
    return {
        id: deck.id,
        cards: deck.cards.map(card => mapCardInputToCardORM(card, currentRoom)),
        room: currentRoom
    }
}

export const mapRoomInputToRoomORM = (room: RoomInput, currentRoom: RoomORM) : RoomORM => {
    return {
        id: room.id,
        players: room.players?.map(player => mapPlayerInputToPlayerORM(player, currentRoom)) || [],
        deck: room.deck ? mapDeckInputToDeckORM(room.deck, currentRoom) : undefined,
        roomState: room.roomState ?? "WAITING",
        discardPile: room.discardPile ? mapDeckInputToDeckORM(room.discardPile, currentRoom) : undefined
    }
}
