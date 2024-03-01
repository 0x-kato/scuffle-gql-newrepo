import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { Tip, User, UserBalance } from './entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User, Tip, UserBalance])],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
