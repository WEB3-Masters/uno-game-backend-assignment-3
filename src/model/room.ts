import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Player } from './player';
import { v4 as uuidv4 } from 'uuid';


@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Player, (player) => player.room)
  players: Player[];

  @Column('simple-json', { nullable: true })
  currentHand: { turnPlayerId: string; cards: string[] } | null;

  @Column({ default: 'waiting' })
  roomState: 'waiting' | 'in-progress' | 'completed';

  constructor(host: Player) {
    this.id = uuidv4();
    this.players = [host];
    this.currentHand = null;
    this.roomState = 'waiting';
  }
}
