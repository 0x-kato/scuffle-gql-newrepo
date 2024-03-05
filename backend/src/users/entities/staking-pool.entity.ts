import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Stake } from './stake.entity';

@ObjectType()
@Entity({ name: 'pools' })
export class StakingPool {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field(() => Float)
  @Column('float')
  interestRate: number;

  @OneToMany(() => Stake, (stake) => stake.pool)
  stakes: Stake[];
}
