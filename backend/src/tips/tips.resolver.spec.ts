import { Test, TestingModule } from '@nestjs/testing';
import { TipsResolver } from './tips.resolver';

describe('TipsResolver', () => {
  let resolver: TipsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipsResolver],
    }).compile();

    resolver = module.get<TipsResolver>(TipsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
