import {
  Stake,
  StakingPool,
  Tip,
  User,
  UserBalance,
} from './src/users/entities';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const config: PostgresConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '4591',
  database: process.env.NODE_ENV == 'TEST' ? 'ScuffleDBtest' : 'ScuffleDB',
  entities: [User, UserBalance, Tip, Stake, StakingPool],
  synchronize: true,
  migrations: ['dist/migrations/*{.ts,.js}'],
};

export default config;
