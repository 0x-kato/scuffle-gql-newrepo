import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StakingPool } from './staking-pool.entity';
import { User } from './user.entity';

@ObjectType()
@Entity({ name: 'stakes' })
export class Stake {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Float)
  @Column('float')
  amount: number;

  @Field(() => Float)
  @Column('float', { default: 0 })
  interestAccumulated: number;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  @CreateDateColumn({ nullable: true })
  lastClaimedAt: Date;

  @Field(() => StakingPool)
  @ManyToOne(() => StakingPool, (pool) => pool.stakes)
  pool: StakingPool;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.stakes)
  user: User;
}
