import { Injectable } from '@nestjs/common';
import StakeDto from './dto/stake-input.dto';

@Injectable()
export class StakingService {
  async stakeTokens(userId: number, poolId: number, stakeInput: StakeDto) {
    return `Staked ${stakeInput.amount} tokens`;
  }

  async unstakeTokens(userId: number, poolId: number, unstakeInput: StakeDto) {
    return `Unstaked ${unstakeInput.amount} tokens`;
  }
}
