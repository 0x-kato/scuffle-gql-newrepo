import { Field, InputType } from '@nestjs/graphql';

@InputType()
export default class StakeDto {
  userId: number;

  poolId: number;

  @Field()
  amount: number;
}
