import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { RoomORM } from './roomORM';
import { v4 as uuid4 } from 'uuid';
import { CardORM } from './cardORM';

@Entity()
export class PlayerORM {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true})
  username: string;

  @Column('text')
  password: string;

  @ManyToOne(() => RoomORM, (room) => room.players, { nullable: true })
  room?: RoomORM;

  @OneToMany(() => CardORM, (card) => card.player, { nullable: true })
  cards?: CardORM[];

  @ManyToOne(() => RoomORM, (room) => room.currentPlayer, { nullable: true })
  currentRoom?: RoomORM;

  constructor(username: string, password: string) {
    this.id = uuid4();
    this.username = username;
    this.password = password;
  }
}
