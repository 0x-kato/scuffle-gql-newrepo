import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TipsService } from './tips.service';
import { GqlAuthGuard } from 'src/auth/guards';
import { UseGuards } from '@nestjs/common';
import TipsDto from './dto/tip-input.dto';
import { GetCurrentUserId } from 'src/common/decorators/get-user-id.decorator';
import { TipHistoryDto } from './dto';

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

  @Query(() => [TipHistoryDto])
  @UseGuards(GqlAuthGuard)
  async getTipsSent(
    @GetCurrentUserId() userId: number,
  ): Promise<TipHistoryDto[]> {
    return this.tipsService.getTipsByUserId(userId);
  }

  @Query(() => [TipHistoryDto])
  @UseGuards(GqlAuthGuard)
  async getTipsReceived(
    @GetCurrentUserId() userId: number,
  ): Promise<TipHistoryDto[]> {
    return this.tipsService.getTipsReceivedByUserId(userId);
  }
}
