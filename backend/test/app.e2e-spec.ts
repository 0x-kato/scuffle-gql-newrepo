import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const dataSource = app.get(DataSource);
    await dataSource.synchronize(true);

    // Insert a pool for staking - done manually as only doing one pool for this project
    await dataSource.query(`INSERT INTO pools ("interestRate") VALUES ($1)`, [
      10.0,
    ]);
    await app.init();
  });

  describe('getUsers', () => {
    it('should query getUsers and return zero users', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `{ users { username } }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.users).toHaveLength(0);
        });
    });
  });

  describe('registerUser', () => {
    it('should create a user', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {
            register(loginUserInput: { username: "testuser", password: "password" }) {
              user {
                user_id
                username
              }
              access_token
            }
          }
          `,
        })
        .expect((res) => {
          expect(res.body.data.register.user).toEqual({
            user_id: 1,
            username: 'testuser',
          });
          expect(res.body.data.register).toHaveProperty('access_token');
        });
    });
  });

  let accessToken = '';

  describe('loginUser', () => {
    it('should login a user', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {
            login(loginUserInput: { username: "testuser", password: "password" }) {
              user {
                user_id
                username
              }
              access_token
            }
          }
          `,
        });

      expect(res.body.data.login.user).toEqual({
        user_id: 1,
        username: 'testuser',
      });
      expect(res.body.data.login).toHaveProperty('access_token');
      accessToken = res.body.data.login.access_token;
    });
  });

  describe('registerSecondUser', () => {
    it('should create a second user', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {
            register(loginUserInput: { username: "testkarl", password: "password" }) {
              user {
                user_id
                username
              }
              access_token
            }
          }
          `,
        })
        .expect((res) => {
          expect(res.body.data.register.user).toEqual({
            user_id: 2,
            username: 'testkarl',
          });
          expect(res.body.data.register).toHaveProperty('access_token');
        });
    });
  });

  describe('tipUser', () => {
    it('should tip a user', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `mutation {
            createTip(tipInput: { receiverUsername: "testkarl", amount: 10})
          }
        `,
        })
        .expect((res) => {
          expect(res.body.data.createTip).toEqual(true);
        });
    });
  });

  //just to ensure balance changes and serialization
  describe('tipUserAgain', () => {
    it('should tip a user again', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `mutation {
            createTip(tipInput: { receiverUsername: "testkarl", amount: 10})
          }
        `,
        })
        .expect((res) => {
          expect(res.body.data.createTip).toEqual(true);
        });
    });
  });

  describe('getBalance', () => {
    it('should query getBalance and return the correct balance', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `{ balance }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.balance).toEqual(80);
        });
    });
  });

  describe('getTips', () => {
    it('should query getTips and return the correct tips', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `
            {
            getTipsByUserId {
              tip_id
              senderUsername
              receiverUsername
              amount
              tip_time
              status
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          console.log('getTips response body:', res.body);
          expect(res.body.data.getTipsByUserId).toHaveLength(2);
        });
    });
  });

  describe('getTipsReceivedByUserId', () => {
    it('should query getTipsReceivedByUserId and return the correct tips', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `
            {
            getTipsReceivedByUserId {
              tip_id
              senderUsername
              receiverUsername
              amount
              tip_time
              status
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          console.log('getTipsReceivedByUserId response body:', res.body);
          expect(res.body.data.getTipsReceivedByUserId).toHaveLength(0);
        });
    });
  });

  describe('stakeTokens', () => {
    it('should stake tokens into pool', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('poolid', '1')
        .send({
          query: `
            mutation {
              stakeTokens(stakeInput: { amount: 10 })
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          console.log('stake response body:', res.body);
          expect(res.body.data.stakeTokens).toEqual(
            'Staked 10 tokens in pool 1',
          );
        });
    });
  });

  describe('getStake', () => {
    it('should query getStakesByUserId and return the correct stakes', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('poolid', '1')
        .send({
          query: `
            {
            getStake {
              amount
              interestAccumulated
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          console.log('getStake response body:', res.body);
          expect(res.body.data.getStake).toEqual({
            amount: 10,
            interestAccumulated: 0,
          });
        });
    });
  });

  describe('addToStake', () => {
    it('should add to stake in pool', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('poolid', '1')
        .send({
          query: `
            mutation {
              addToStake(stakeInput: { amount: 10 })
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          console.log('add to stake response body:', res.body);
          expect(res.body.data.addToStake).toEqual(
            'Added 10 tokens to existing stake',
          );
        });
    });
  });

  describe('withdrawRewards', () => {
    it('should claim rewards from pool', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('poolid', '1')
        .send({
          query: `
            mutation {
              withdrawRewards
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          console.log('claim rewards response body:', res.body);
          expect(res.body.data.withdrawRewards).toEqual(
            'Withdrew rewards from pool 1',
          );
        });
    });
  });

  describe('unstakeTokens', () => {
    it('should unstake tokens from pool', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('poolid', '1')
        .send({
          query: `
            mutation {
              unstakeTokens(unstakeInput: { amount: 10 })
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          console.log('unstake response body:', res.body);
          expect(res.body.data.unstakeTokens).toEqual(
            'Unstaked 10 tokens from pool 1',
          );
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
