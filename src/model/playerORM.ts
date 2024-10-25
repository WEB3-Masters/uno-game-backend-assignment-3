import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { RoomORM } from './roomORM';
import { v4 as uuid4 } from 'uuid';

@Entity()
export class PlayerORM {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @ManyToOne(() => RoomORM, (room) => room.players, { nullable: true })
  room?: RoomORM;

  constructor(username: string, password: string) {
    this.id = uuid4();
    this.username = username;
    this.password = password;
  }
}
