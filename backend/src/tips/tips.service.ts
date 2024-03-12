import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tip, User, UserBalance } from '../users/entities';
import { Repository } from 'typeorm';
import TipsDto from './dto/tip-input.dto';

@Injectable()
export class TipsService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserBalance)
    private balanceRepository: Repository<UserBalance>,
    @InjectRepository(Tip) private tipRepository: Repository<Tip>,
  ) {}

  //addded A LOT of console.logs to help debug
  async createTip(tipDto: TipsDto, userId: number): Promise<boolean> {
    const { receiverUsername, amount } = tipDto;
    const senderId = userId;

    console.log(tipDto);
    console.log(
      `Request to create tip: Sender ID = ${senderId}, Receiver = ${receiverUsername}, Amount = ${amount}`,
    );

    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const queryString = `SELECT u.user_id, u.lowercase_username, b.balance 
      FROM "users" u
      JOIN "balances" b ON u.user_id = b.user_id
      WHERE u.lowercase_username = $1 OR u.user_id = $2`;

      const queryParams = [receiverUsername.toLowerCase(), senderId];

      console.log('Executing query:', queryString);
      console.log('Query parameters:', queryParams);

      const results = await queryRunner.manager.query(queryString, queryParams);
      console.log('Results:', results);

      //debug logic to check user objects returned
      if (results.length < 2) {
        const foundSender = results.find(
          (result) => result.user_id === senderId,
        );
        const foundReceiver = results.find(
          (result) =>
            result.lowercase_username === receiverUsername.toLowerCase(),
        );
        if (!foundSender) {
          throw new NotFoundException(
            `Sender with user ID ${senderId} not found.`,
          );
        }
        if (!foundReceiver) {
          throw new NotFoundException(
            `Receiver with username ${receiverUsername} not found.`,
          );
        }
      }

      const senderBalance = results.find(
        (r) => r.user_id === senderId,
      )?.balance;
      const receiverResult = results.find(
        (r) => r.lowercase_username === receiverUsername.toLowerCase(),
      );

      console.log('Sender Balance:', senderBalance);
      console.log('Receiver Result:', receiverResult);

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

  async getTipsByUserId(userId: number): Promise<Tip[]> {
    return this.tipRepository.find({
      where: { sender_id: userId },
      relations: ['sender', 'receiver'],
    });
  }

  async getTipsReceivedByUserId(userId: number): Promise<Tip[]> {
    return this.tipRepository.find({
      where: { receiver_id: userId },
      relations: ['sender', 'receiver'],
    });
  }
}
