import { Field, InputType } from '@nestjs/graphql';

@InputType()
export default class StakeDto {
  userId: number;

  //might need getGetPoolId() decorator for resolver
  poolId: number;

  @Field()
  amount: number;
}
