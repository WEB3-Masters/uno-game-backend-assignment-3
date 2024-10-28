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

  @Column({ default: 'waiting' })
  roomState: 'waiting' | 'in-progress' | 'completed';
    discardPile: any;
    hands: any;

  constructor(host: PlayerORM, deck: DeckORM) {
    this.id = uuid4();
    this.players = [host];
    this.roomState = 'waiting';
    this.deck = deck;
  }
}
