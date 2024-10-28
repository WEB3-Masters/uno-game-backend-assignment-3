import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { DeckORM } from './deckORM';
import {v4 as uuid4} from "uuid";

export type CardType = "SKIP" | "NUMBERED" | "REVERSE" | "DRAW" | "WILD" | "WILD DRAW";
export type CardColor = "BLUE" | "GREEN" | "RED" | "YELLOW";

@Entity()
export class CardORM {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: ["SKIP", "NUMBERED", "REVERSE", "DRAW", "WILD", "WILD DRAW"] })
    type: CardType;

    @Column({ type: 'enum', enum: ["BLUE", "GREEN", "RED", "YELLOW"], nullable: true })
    color?: CardColor;

    @Column({ type: 'int', nullable: true })
    number?: number;

    @ManyToOne(() => DeckORM, (deck) => deck.cards)
    deck?: DeckORM;

    constructor(type: CardType, color?: CardColor, number?: number) {
        this.id = uuid4();
        this.type = type;
        this.color = color;
        this.number = number;
    }
}