import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class TipHistoryDto {
  @Field(() => Int)
  tip_id: number;

  @Field()
  sender: string;

  @Field()
  receiver: string;

  @Field(() => Float)
  amount: number;

  @Field()
  tip_time: Date;

  @Field()
  status: string;

  constructor(tip: any) {
    this.tip_id = tip.tip_id;
    this.sender = tip.sender;
    this.receiver = tip.receiver;
    this.amount = tip.amount;
    this.tip_time = tip.tip_time;
    this.status = tip.status;
  }
}
