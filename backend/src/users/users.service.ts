import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserBalance } from './entities';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserBalance)
    private userBalanceRepository: Repository<UserBalance>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async getBalance(userId: number): Promise<number> {
    const userBalance = await this.userBalanceRepository.findOne({
      where: { user: { user_id: userId } },
    });
    return userBalance ? userBalance.balance : 0;
  }
}
