import { Module } from '@nestjs/common';
import { StakingService } from './staking.service';
import { StakingResolver } from './staking.resolver';
import { Stake, StakingPool, User, UserBalance } from 'src/users/entities';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserBalance, StakingPool, Stake]),
    PassportModule,
    UsersModule,
    StakingModule,
  ],
  providers: [StakingService, StakingResolver],
})
export class StakingModule {}