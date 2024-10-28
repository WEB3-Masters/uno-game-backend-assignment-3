import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { PlayerORM } from './playerORM';
import { DeckORM } from './deckORM';
import { v4 as uuid4 } from 'uuid';


@Entity()
export class RoomORM {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => PlayerORM, (player) => player.room)
  players: PlayerORM[];

  @OneToOne(() => DeckORM, (deck) => deck.room)
  deck: DeckORM;

  @Column('text', { default: 'waiting' })
  roomState: 'waiting' | 'in-progress' | 'completed';

  @OneToOne(() => DeckORM, (deck) => deck.room)
  discardPile: DeckORM;

  //hands: any;

  constructor(players: PlayerORM[], deck: DeckORM, discardPile: DeckORM) {
    this.id = uuid4();
    this.players = players;
    this.roomState = 'waiting';
    this.deck = deck;
    this.discardPile = discardPile;
  }
}
