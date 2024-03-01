import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginResponse } from './dto/login-response.dto';
import { LoginUserInput } from './dto/login-user.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './guards/gql-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginResponse)
  @UseGuards(GqlAuthGuard)
  login(@Args('loginUserInput') loginUserInput: LoginUserInput) {
    return this.authService.login(loginUserInput);
  }

  @Mutation(() => LoginResponse)
  async register(
    @Args('loginUserInput') loginUserInput: LoginUserInput,
  ): Promise<LoginResponse> {
    const newUser = await this.authService.register(loginUserInput);
    console.log(newUser);
    return newUser;
  }
}
