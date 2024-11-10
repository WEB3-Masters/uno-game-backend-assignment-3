import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
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
  @JoinColumn({ name: 'deckId' })
  deck?: DeckORM;

  @Column('text', { default: 'WAITING' })
  roomState: 'WAITING' | 'IN_PROGRESS'

  @OneToOne(() => DeckORM, (discardPile) => discardPile.room)
  @JoinColumn({ name: 'discardPileId' })
  discardPile?: DeckORM;

  @OneToOne(() => PlayerORM, (player) => player.room)
  currentPlayer?: PlayerORM;

  constructor(players: PlayerORM[], deck?: DeckORM, discardPile?: DeckORM) {
    this.id = uuid4();
    this.players = players;
    this.roomState = 'WAITING';
    this.deck = deck;
    this.discardPile = discardPile;
  }
}
