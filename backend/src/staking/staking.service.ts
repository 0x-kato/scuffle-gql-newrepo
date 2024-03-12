import { Injectable } from '@nestjs/common';
import { Stake, StakingPool, User, UserBalance } from './../users/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { differenceInSeconds } from 'date-fns';
import { StakeDetails } from '../common/types';
import StakeDto from './dto/stake-input.dto';

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

  async getStake(userId: number, poolId: number): Promise<StakeDetails> {
    const stake = await this.stakeRepository.findOne({
      where: {
        user: { user_id: userId },
        pool: { id: poolId },
      },
      relations: ['user', 'pool'],
    });

    console.log('GET STAKE CALLED');
    if (!stake) {
      throw new Error('Stake not found');
    }

    const rewards = await this.calculateRewards(stake);
    console.log(rewards);

    return {
      amount: stake.amount,
      interestAccumulated: rewards,
    };
  }

  async checkStake(userId: number, poolId: number): Promise<boolean> {
    const stake = await this.stakeRepository.findOne({
      where: {
        user: { user_id: userId },
        pool: { id: poolId },
      },
    });
    console.log('CHECK STAKE CALLED');
    if (!stake) {
      return false;
    }

    return true;
  }

  async addToStake(userId: number, poolId: number, stakeInput: StakeDto) {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    console.log('ADD TO STAKE CALLED');

    try {
      const stake = await this.stakeRepository.findOne({
        where: {
          user: { user_id: userId },
          pool: { id: poolId },
        },
      });

      if (!stake) {
        throw new Error('Stake not found.');
      }

      const userBalance = await this.balanceRepository.findOne({
        where: {
          user_id: userId,
        },
      });

      //added logic to update stake with rewards amount
      // prevents calculation errors of the rewards
      //can also be considered a "compounding" feature
      stake.amount += await this.calculateRewards(stake);
      stake.lastClaimedAt = new Date();

      stake.amount += stakeInput.amount;
      userBalance.balance -= stakeInput.amount;

      if (!userBalance || userBalance.balance < stakeInput.amount) {
        throw new Error('Insufficient balance.');
      }

      await queryRunner.manager.save(stake);
      await queryRunner.manager.save(userBalance);

      await queryRunner.commitTransaction();

      return `Added ${stakeInput.amount} tokens to existing stake`;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async stakeTokens(userId: number, poolId: number, stakeInput: StakeDto) {
    const stakerId = userId;
    const { amount } = stakeInput;
    console.log('STAKE TOKENS CALLED');
    console.log(poolId, ' is pool id');

    //updated check to existing stake
    const existingStake = await this.checkStake(userId, poolId);
    if (existingStake) {
      console.log('existing stake found');
      console.log(existingStake);
      return this.addToStake(userId, poolId, stakeInput);
    }

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

      const userId = await this.userRepository.findOne({
        where: {
          user_id: stakerId,
        },
      });

      const stakingPool = await this.stakingPoolRepository.findOne({
        where: {
          id: poolId,
        },
      });

      console.log('staking pool:', stakingPool);

      if (userBalance.balance < amount) {
        throw new Error('Insufficient balance');
      }

      //update user's balance
      userBalance.balance -= amount;

      //create stake object
      const stake = new Stake();
      stake.amount = amount;
      stake.pool = stakingPool;
      stake.user = userId;

      console.log(stakingPool);
      console.log(poolId);

      //save stake and update user's balance
      await queryRunner.manager.save(stake);
      await queryRunner.manager.save(userBalance);

      //commit transaction
      await queryRunner.commitTransaction();
      return `Staked ${stakeInput.amount} tokens in pool ${poolId}`;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async calculateRewards(stake: Stake): Promise<number> {
    const stakeInQ = await this.stakeRepository.findOne({
      where: { id: stake.id },
      relations: ['pool'],
    });
    if (!stakeInQ) {
      throw new Error(`Pool with id ${stake.pool.id} not found.`);
    }
    console.log(stakeInQ);
    const interestRate = stakeInQ.pool.interestRate / 100;
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
      //update user balance with rewards
      userBalance.balance += await this.calculateRewards(stake);
      stake.lastClaimedAt = new Date();

      //remove from stake
      stake.amount -= amount;

      //update user's balance
      userBalance.balance += amount;

      await queryRunner.manager.save(stake);
      await queryRunner.manager.save(userBalance);
      await queryRunner.commitTransaction();

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

    //potential vulnerability: doesn't check if rewards > 0? needed?

    console.log('withdrawRewards called');
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

      return `Withdrew rewards from pool ${poolId}`;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
