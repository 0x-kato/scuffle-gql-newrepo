import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/guards';
import { GetCurrentUserId, GetPoolId } from 'src/common/decorators';
import StakeDto from './dto/stake-input.dto';
import { StakingService } from './staking.service';

@Resolver()
export class StakingResolver {
  constructor(private stakingService: StakingService) {}
  //could put a create staking pool function here in future
  //will manually input staking pool into database for now

  //building function to let users view their staked tokens
  //also returns rewards available for withdrawal
  @Query(() => String)
  @UseGuards(GqlAuthGuard)
  async getStake(
    @GetCurrentUserId() userId: number,
    @GetPoolId() poolId: number,
  ) {
    return this.stakingService.getStake(userId, poolId);
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async stakeTokens(
    @GetCurrentUserId() userId: number,
    @GetPoolId() poolId: number,
    @Args('stakeInput') stakeInput: StakeDto,
  ) {
    return this.stakingService.stakeTokens(userId, poolId, stakeInput);
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async unstakeTokens(
    @GetCurrentUserId() userId: number,
    @GetPoolId() poolId: number,
    @Args('stakeInput') unstakeInput: StakeDto,
  ) {
    return this.stakingService.unstakeTokens(userId, poolId, unstakeInput);
  }

  //function to withdraw rewards while leaving stake
  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async withdrawRewards(
    @GetCurrentUserId() userId: number,
    @GetPoolId() poolId: number,
  ) {
    return this.stakingService.withdrawRewards(userId, poolId);
  }
}
