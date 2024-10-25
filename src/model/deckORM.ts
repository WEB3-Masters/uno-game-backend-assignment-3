import {Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne} from 'typeorm';
import { CardORM } from './cardORM';
import { v4 as uuid4 } from 'uuid';
import {RoomORM} from "./roomORM";

@Entity()
export class DeckORM {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToMany(() => CardORM, (card) => card.deck, { cascade: true })
    cards: CardORM[];

    @OneToOne(() => RoomORM, (room) => room.deck)
    room: RoomORM;

    constructor(id: string = uuid4(), cards: CardORM[] = [], room: RoomORM) {
        this.id = id;
        this.cards = cards;
        this.room = room;
    }
}
