import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/guards';
import { GetCurrentUserId, GetPoolId } from 'src/common/decorators';
import StakeDto from './dto/stake-input.dto';
import { StakingService } from './staking.service';

@Resolver()
export class StakingResolver {
  constructor(private stakingService: StakingService) {}
  //building function to let users stake their "tokens" into a staking pool
  //function will take in the amount of tokens to stake and the user's id
  //function will return a success message with amount of tokens staked
  //
  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async stakeTokens(
    @GetCurrentUserId() userId: number,
    @GetPoolId() poolId: number,
    @Args('tipInput') stakeInput: StakeDto,
  ) {
    return this.stakingService.stakeTokens(userId, poolId, stakeInput);
  }

  //building function to let users unstake their "tokens" from the staking pool
  //function will take in the amount of tokens to unstake and the user's id
  //function will also withdraw token rewards from staking
  //function will return a success message with amount of tokens unstaked

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async unstakeTokens(
    @GetCurrentUserId() userId: number,
    @GetPoolId() poolId: number,
    @Args('tipInput') unstakeInput: StakeDto,
  ) {
    return this.stakingService.unstakeTokens(userId, poolId, unstakeInput);
  }
}
