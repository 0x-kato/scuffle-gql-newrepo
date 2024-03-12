import { Module } from '@nestjs/common';
import { TipsService } from './tips.service';
import { TipsResolver } from './tips.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tip, User, UserBalance } from '../users/entities';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tip, UserBalance]),
    PassportModule,
    UsersModule,
  ],
  providers: [TipsService, TipsResolver],
})
export class TipsModule {}
