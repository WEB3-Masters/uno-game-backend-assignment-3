import { Card, CardColor, CardType, Player, Room, RoomState } from "__generated__/schema-types"
import { CardORM } from "model/cardORM"
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