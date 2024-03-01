import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { User } from './user.entity';

@ObjectType()
@Entity({ name: 'tips' })
export class Tip {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  tip_id: number;

  @Field(() => Int)
  @Column()
  sender_id: number;

  @Field(() => Int)
  @Column()
  receiver_id: number;

  @Field(() => Float)
  @Column('float')
  amount: number;

  @Field()
  @Column()
  tip_time: Date;

  @Field()
  @Column()
  status: string;

  //defining the relationship between the user and the tip

  @ManyToOne(() => User, (user) => user.tipsSent)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, (user) => user.tipsReceived)
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;
}
