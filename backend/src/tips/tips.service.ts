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

  async getTipsByUserId(userId: number): Promise<TipHistoryDto[]> {
    console.log('Getting tips sent by user ID:', userId);
    const tips = await this.tipRepository.find({
      where: { sender_id: userId },
      relations: ['sender', 'receiver'],
    });

    console.log(tips);

    console.log(
      'Tips:',
      tips.map((t) => ({
        tip_id: t.tip_id,
        sender: t.sender?.username,
        receiver: t.receiver?.username,
      })),
    );

    const validTips = tips.filter((tip) => tip.sender && tip.receiver);

    const tipDtos = validTips.map(
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

    console.log('Mapped DTOs:', tipDtos);
    return tipDtos;
  }

  async getTipsReceivedByUserId(userId: number): Promise<TipHistoryDto[]> {
    console.log('Getting tips received by user ID:', userId);
    const tips = await this.tipRepository.find({
      where: [{ receiver_id: userId }],
      relations: ['sender', 'receiver'],
    });

    console.log(tips);

    const tipDtos = tips.map((tip) => {
      console.log('Current tip:', tip);
      console.log('Sender username:', tip.sender.username);
      console.log('Receiver username:', tip.receiver.username);

      return new TipHistoryDto({
        tip_id: tip.tip_id,
        sender: tip.sender.username,
        receiver: tip.receiver.username,
        amount: tip.amount,
        tip_time: tip.tip_time,
        status: tip.status,
      });
    });

    console.log('Mapped DTOs:', tipDtos);
    return tipDtos;
  }
}
