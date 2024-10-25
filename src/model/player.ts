import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Room } from './room';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @ManyToOne(() => Room, (room) => room.players, { nullable: true })
  room?: Room;

  constructor(username: string, password: string) {
    this.id = uuidv4();
    this.username = username;
    this.password = password;
  }
}
