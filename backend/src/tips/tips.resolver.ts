import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TipsService } from './tips.service';
import { GqlAuthGuard } from '../auth/guards';
import { UseGuards } from '@nestjs/common';
import TipsDto from './dto/tip-input.dto';
import { GetCurrentUserId } from '../common/decorators';
import { Tip } from './../users/entities';

@Resolver()
export class TipsResolver {
  constructor(private tipsService: TipsService) {}

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async createTip(
    @Args('tipInput') tipInput: TipsDto,
    @GetCurrentUserId() userId: number,
  ): Promise<boolean> {
    return this.tipsService.createTip(tipInput, userId);
  }

  @Query(() => [Tip])
  @UseGuards(GqlAuthGuard)
  async getTipsByUserId(@GetCurrentUserId() userId: number): Promise<Tip[]> {
    return this.tipsService.getTipsByUserId(userId);
  }

  @Query(() => [Tip])
  @UseGuards(GqlAuthGuard)
  async getTipsReceivedByUserId(
    @GetCurrentUserId() userId: number,
  ): Promise<Tip[]> {
    return this.tipsService.getTipsReceivedByUserId(userId);
  }
}
