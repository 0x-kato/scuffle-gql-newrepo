import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tip } from './tip.entity';
import { UserBalance } from './user-balance.entity';

@ObjectType()
@Entity({ name: 'users' })
export class User {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  user_id: number;

  @Field()
  @Column()
  username: string;

  @Field()
  @Column()
  password: string;

  @Field()
  @Column({ unique: true })
  lowercase_username: string;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Tip, (tip) => tip.sender)
  @Field(() => [Tip])
  tipsSent: Tip[];

  @OneToMany(() => Tip, (tip) => tip.receiver)
  @Field(() => [Tip])
  tipsReceived: Tip[];

  @OneToMany(() => UserBalance, (userBalance) => userBalance.user)
  @Field(() => [UserBalance])
  balances: UserBalance[];
}
