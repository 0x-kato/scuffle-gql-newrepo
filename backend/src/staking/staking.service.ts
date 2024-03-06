import { Injectable } from '@nestjs/common';
import StakeDto from './dto/stake-input.dto';
import { Stake, StakingPool, User, UserBalance } from 'src/users/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { differenceInSeconds } from 'date-fns';

@Injectable()
export class StakingService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserBalance)
    private balanceRepository: Repository<UserBalance>,
    @InjectRepository(Stake) private stakeRepository: Repository<Stake>,
    @InjectRepository(StakingPool)
    private stakingPoolRepository: Repository<StakingPool>,
  ) {}

  async getStake(userId: number, poolId: number) {
    //will retrieve user's stake in a pool
    return this.stakeRepository.findOne({
      where: {
        user: { user_id: userId },
        pool: { id: poolId },
      },
    });
  }

  //building function to let users stake their "tokens" into a staking pool
  //function will take in the amount of tokens to stake and the user's id
  //function will return a success message with amount of tokens staked

  async stakeTokens(userId: number, poolId: number, stakeInput: StakeDto) {
    const stakerId = userId;
    const { amount } = stakeInput;

    //execute transaction to stake tokens
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userBalance = await this.balanceRepository.findOne({
        where: {
          user_id: stakerId,
        },
      });

      const stakingPool = await this.stakingPoolRepository.findOne({
        where: {
          id: poolId,
        },
      });

      //update user's balance
      userBalance.balance -= amount;

      //create stake object
      const stake = new Stake();
      stake.amount = amount;
      stake.pool = stakingPool;
      stake.user = userBalance.user;

      //save stake and update user's balance
      await queryRunner.manager.save(stake);
      await queryRunner.manager.save(userBalance);

      if (userBalance.balance < amount) {
        throw new Error('Insufficient balance');
      }

      //commit transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    return `Staked ${stakeInput.amount} tokens in pool ${poolId}`;
  }

  async calculateRewards(stake: Stake): Promise<number> {
    const interestRate = stake.pool.interestRate / 100;
    const today = new Date();
    const lastClaimedDate = stake.lastClaimedAt || stake.createdAt;
    const timeDiff = differenceInSeconds(today, lastClaimedDate);

    const perSecondInterestRate = interestRate / 31536000; //secs in year
    const unclaimedInterest = stake.amount * perSecondInterestRate * timeDiff;

    return unclaimedInterest;
  }

  //update to raw sql queries + await queryRunner on every lookup
  async unstakeTokens(userId: number, poolId: number, unstakeInput: StakeDto) {
    const stakerId = userId;
    const { amount } = unstakeInput;

    //execute transaction to unstake tokens
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //unstake logic takes amount from dto and subtracts from stake amount
      //if amount is greater than stake amount, throw error

      const userBalance = await this.balanceRepository.findOne({
        where: {
          user_id: stakerId,
        },
      });

      const stakingPool = await this.stakingPoolRepository.findOne({
        where: {
          id: poolId,
        },
      });

      const stake = await this.stakeRepository.findOne({
        where: {
          user: userBalance.user,
          pool: stakingPool,
        },
      });

      if (amount > stake.amount) {
        throw new Error('Insufficient stake amount');
      }

      //remove from stake
      stake.amount -= amount;

      //update user's balance
      userBalance.balance += amount;

      //update user's balance with rewards
      userBalance.balance += await this.calculateRewards(stake);

      //save stake and update user's balance
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
    return `Unstaked ${unstakeInput.amount} tokens from pool ${poolId}`;
  }

  async withdrawRewards(userId: number, poolId: number) {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userBalance = await this.balanceRepository.findOne({
        where: {
          user_id: userId,
        },
      });

      const stakingPool = await this.stakingPoolRepository.findOne({
        where: {
          id: poolId,
        },
      });

      const stake = await this.stakeRepository.findOne({
        where: {
          user: userBalance.user,
          pool: stakingPool,
        },
      });

      userBalance.balance += await this.calculateRewards(stake);

      //pass in update to claim date so that it resets the available rewards
      stake.lastClaimedAt = new Date();

      await queryRunner.manager.save(userBalance);
      await queryRunner.manager.save(stake);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
