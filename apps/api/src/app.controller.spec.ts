import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return status ok and ISO timestamp', () => {
      const res = appController.health();
      expect(res.status).toBe('ok');
      expect(typeof res.timestamp).toBe('string');
      expect(() => new Date(res.timestamp).toISOString()).not.toThrow();
    });
  });
});
