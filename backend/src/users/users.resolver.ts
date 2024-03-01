import { Resolver, Query, Args, Int, Float } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards';
import { GetCurrentUserId } from 'src/common/decorators';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  //using guard here to just test out the auth guard
  //definitely not necessary, would most likely guard with an authentication guard i.e. roles
  @Query(() => [User], { name: 'users' })
  @UseGuards(GqlAuthGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('username', { type: () => Int }) username: string) {
    return this.usersService.findOne(username);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Float, { name: 'balance' })
  async getBalance(@GetCurrentUserId() userId: number): Promise<number> {
    return this.usersService.getBalance(userId);
  }
}
