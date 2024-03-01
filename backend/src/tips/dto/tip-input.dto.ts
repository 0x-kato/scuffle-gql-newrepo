import { Field, InputType } from '@nestjs/graphql';

@InputType()
export default class TipsDto {
  senderId: number;

  @Field()
  receiverUsername: string;

  @Field()
  amount: number;
}
