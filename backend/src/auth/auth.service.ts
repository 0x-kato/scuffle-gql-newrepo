import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User, UserBalance } from '../users/entities';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { LoginResponse, LoginUserInput } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserBalance)
    private balanceRepository: Repository<UserBalance>,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    const valid = await argon.verify(user?.password, password);
    if (user && valid) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginUserInput: LoginUserInput): Promise<LoginResponse> {
    const { username, password } = loginUserInput;

    const lowercaseUsername = username.toLowerCase();

    const user = await this.userRepository.findOne({
      where: { lowercase_username: lowercaseUsername },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatched = await argon.verify(user.password, password);
    if (!passwordMatched) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.user_id };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user,
    };
  }

  async register(loginUserInput: LoginUserInput): Promise<LoginResponse> {
    const { username, password } = loginUserInput;
    const hashedPassword = await argon.hash(password);

    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let newUser = queryRunner.manager.create(User, {
        username,
        password: hashedPassword,
        lowercase_username: username.toLowerCase(),
      });

      newUser = await queryRunner.manager.save(newUser);
      const newUserBalance = queryRunner.manager.create(UserBalance, {
        user_id: newUser.user_id,
        balance: 100,
        last_updated: new Date(),
      });

      await queryRunner.manager.save(newUserBalance);

      await queryRunner.commitTransaction();

      const access_token = this.jwtService.sign({
        userId: newUser.user_id,
      });
      return { user: newUser, access_token };
    } catch (error) {
      // Rollback in case of an error
      await queryRunner.rollbackTransaction();
      throw new HttpException('Registration failed', HttpStatus.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }
}
