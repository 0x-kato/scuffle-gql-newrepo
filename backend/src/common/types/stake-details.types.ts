import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class StakeDetails {
  @Field(() => Float)
  amount: number;

  @Field(() => Float)
  interestAccumulated: number;
}
