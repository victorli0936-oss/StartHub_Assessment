import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WaitlistResolver } from './waitlist.resolver';
import { WaitlistService } from './waitlist.service';
import { EmailValidationPipe } from './pipes/email-validation.pipe';

describe('WaitlistResolver', () => {
  let resolver: WaitlistResolver;
  let service: WaitlistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaitlistResolver,
        WaitlistService,
      ],
    }).compile();

    resolver = module.get<WaitlistResolver>(WaitlistResolver);
    service = module.get<WaitlistService>(WaitlistService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('addToWaitlist', () => {
    it('should call service.addToWaitlist with email', async () => {
      const email = 'test@example.com';
      const expectedResult = {
        email: email.toLowerCase(),
        isRegistered: true,
        registeredAt: new Date().toISOString(),
      };

      jest.spyOn(service, 'addToWaitlist').mockResolvedValue(expectedResult);

      const result = await resolver.addToWaitlist(email);

      expect(service.addToWaitlist).toHaveBeenCalledWith(email);
      expect(result).toEqual(expectedResult);
    });

    it('should return WaitlistStatusDto with correct structure', async () => {
      const email = 'newuser@example.com';
      const result = await resolver.addToWaitlist(email);

      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('isRegistered');
      expect(result).toHaveProperty('registeredAt');
      expect(result.isRegistered).toBe(true);
    });
  });

  describe('getWaitlistStatus', () => {
    it('should call service.getWaitlistStatus with email', async () => {
      const email = 'test@example.com';
      const expectedResult = {
        email: email.toLowerCase(),
        isRegistered: true,
        registeredAt: new Date().toISOString(),
      };

      jest.spyOn(service, 'getWaitlistStatus').mockResolvedValue(expectedResult);

      const result = await resolver.getWaitlistStatus(email);

      expect(service.getWaitlistStatus).toHaveBeenCalledWith(email);
      expect(result).toEqual(expectedResult);
    });

    it('should return WaitlistStatusDto with correct structure', async () => {
      const email = 'status@example.com';
      const result = await resolver.getWaitlistStatus(email);

      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('isRegistered');
      expect(result.email).toBe(email.toLowerCase());
    });
  });
});