import { Field, Int } from '@nestjs/graphql';

export class TipResponse {
  @Field(() => Int, { nullable: true })
  tipId?: number;

  @Field({ nullable: true })
  message?: string;
}
