import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tip, User, UserBalance } from 'src/users/entities';
import { Repository } from 'typeorm';
import TipsDto from './dto/tip-input.dto';
import { TipHistoryDto } from './dto/tip-history.dto';

@Injectable()
export class TipsService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserBalance)
    private balanceRepository: Repository<UserBalance>,
    @InjectRepository(Tip) private tipRepository: Repository<Tip>,
  ) {}
  //create tipping logic below, console.log is just a placeholder
  async createTip(tipDto: TipsDto, userId: number): Promise<boolean> {
    const { receiverUsername, amount } = tipDto;
    const senderId = userId;
    console.log(userId);
    console.log('Creating tip for user:');

    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const results = await queryRunner.manager.query(
        `SELECT u.user_id, u.lowercase_username, b.balance 
            FROM "users" u
            JOIN "balances" b ON u.user_id = b.user_id
            WHERE u.lowercase_username = $1
            OR u.user_id = $2`,
        [receiverUsername.toLowerCase(), senderId],
      );

      console.log(`Creating tip from user ${senderId} to ${receiverUsername}`);

      if (results.length < 2) {
        throw new NotFoundException(`One or both users not found.`);
      }

      const senderBalance = results.find(
        (r) => r.user_id === senderId,
      )?.balance;
      const receiverResult = results.find(
        (r) => r.lowercase_username === receiverUsername.toLowerCase(),
      );

      if (!receiverResult) {
        throw new NotFoundException(
          `Receiver with username "${receiverUsername}" not found.`,
        );
      }

      await queryRunner.manager.query(
        `UPDATE "balances" SET balance = balance - $1 WHERE user_id = $2`,
        [amount, senderId],
      );

      await queryRunner.manager.query(
        `UPDATE "balances" SET balance = balance + $1 WHERE user_id = $2`,
        [amount, receiverResult.user_id],
      );

      await queryRunner.manager.query(
        `INSERT INTO "tips" (sender_id, receiver_id, amount, tip_time, status) VALUES ($1, $2, $3, NOW(), 'Completed')`,
        [senderId, receiverResult.user_id, amount],
      );

      await queryRunner.manager.update;

      if (senderBalance <= 0 || senderBalance < amount) {
        throw new Error('Insufficient sender balance.');
      }

      await queryRunner.commitTransaction();
      return true;
    } catch (e) {
      console.error(e);
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async getTipsByUserId(userId: number): Promise<TipHistoryDto[]> {
    const tips = await this.tipRepository.find({
      where: { sender_id: userId },
      relations: ['sender', 'receiver'],
    });

    return tips.map(
      (tip) =>
        new TipHistoryDto({
          tip_id: tip.tip_id,
          sender: tip.sender.username,
          receiver: tip.receiver.username,
          amount: tip.amount,
          tip_time: tip.tip_time,
          status: tip.status,
        }),
    );
  }

  async getTipsReceivedByUserId(userId: number): Promise<TipHistoryDto[]> {
    const tips = await this.tipRepository.find({
      where: [{ receiver_id: userId }],
      relations: ['sender', 'receiver'],
    });

    return tips.map(
      (tip) =>
        new TipHistoryDto({
          tip_id: tip.tip_id,
          sender: tip.sender.username,
          receiver: tip.receiver.username,
          amount: tip.amount,
          tip_time: tip.tip_time,
          status: tip.status,
        }),
    );
  }
}