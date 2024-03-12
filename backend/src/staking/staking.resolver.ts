import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards';
import { GetCurrentUserId, GetPoolId } from '../common/decorators';
import StakeDto from './dto/stake-input.dto';
import { StakingService } from './staking.service';
import { StakeDetails } from '../common/types';

@Resolver()
export class StakingResolver {
  constructor(private stakingService: StakingService) {}
  //could put a create staking pool function here in future
  //will manually input staking pool into database for now

  @Query(() => StakeDetails)
  @UseGuards(GqlAuthGuard)
  async getStake(
    @GetCurrentUserId() userId: number,
    @GetPoolId() poolId: number,
  ): Promise<StakeDetails> {
    return this.stakingService.getStake(userId, poolId);
  }

  //add to stake will automatically collect pending rewards to simplify reward calculation
  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async addToStake(
    @GetCurrentUserId() userId: number,
    @GetPoolId() poolId: number,
    @Args('stakeInput') stakeInput: StakeDto,
  ) {
    return this.stakingService.addToStake(userId, poolId, stakeInput);
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
    @Args('unstakeInput') unstakeInput: StakeDto,
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
