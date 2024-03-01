import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { LoginUserInput } from './login-user.dto';

@InputType()
export class UpdateUserInput extends PartialType(LoginUserInput) {
  @Field(() => Int)
  id: number;
}
