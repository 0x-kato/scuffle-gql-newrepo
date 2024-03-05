import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { User } from './user.entity';

@ObjectType()
@Entity({ name: 'balances' })
export class UserBalance {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  balance_id: number;

  @Field(() => Int)
  @Column({ unique: true })
  user_id: number;

  @Field(() => Float)
  @Column('float')
  balance: number;

  @Field()
  @Column()
  last_updated: Date;

  //define relationship between the user and the balance

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
