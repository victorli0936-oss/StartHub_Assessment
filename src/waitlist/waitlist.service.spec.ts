import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';

describe('WaitlistService', () => {
  let service: WaitlistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WaitlistService],
    }).compile();

    service = module.get<WaitlistService>(WaitlistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToWaitlist', () => {
    it('should add a new email to the waitlist', async () => {
      const email = 'test@example.com';
      const result = await service.addToWaitlist(email);

      expect(result).toBeDefined();
      expect(result.email).toBe(email.toLowerCase());
      expect(result.isRegistered).toBe(true);
      expect(result.registeredAt).toBeDefined();
      expect(new Date(result.registeredAt)).toBeInstanceOf(Date);
    });

    it('should normalize email to lowercase', async () => {
      const email = 'TestUser@Example.COM';
      const result = await service.addToWaitlist(email);

      expect(result.email).toBe('testuser@example.com');
    });

    it('should trim whitespace from email', async () => {
      const email = '  test@example.com  ';
      const result = await service.addToWaitlist(email);

      expect(result.email).toBe('test@example.com');
    });

    it('should throw ConflictException when email already exists', async () => {
      const email = 'duplicate@example.com';
      
      await service.addToWaitlist(email);

      await expect(service.addToWaitlist(email)).rejects.toThrow(
        ConflictException,
      );
      
      await expect(service.addToWaitlist(email)).rejects.toThrow(
        'Email duplicate@example.com is already registered in the waitlist',
      );
    });

    it('should throw ConflictException for case-insensitive duplicates', async () => {
      const email1 = 'Test@Example.com';
      const email2 = 'test@example.com';
      
      await service.addToWaitlist(email1);
      
      await expect(service.addToWaitlist(email2)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should store multiple different emails', async () => {
      const email1 = 'user1@example.com';
      const email2 = 'user2@example.com';
      const email3 = 'user3@example.com';

      const result1 = await service.addToWaitlist(email1);
      const result2 = await service.addToWaitlist(email2);
      const result3 = await service.addToWaitlist(email3);

      expect(result1.email).toBe('user1@example.com');
      expect(result2.email).toBe('user2@example.com');
      expect(result3.email).toBe('user3@example.com');
    });
  });

  describe('getWaitlistStatus', () => {
    it('should return registered status for existing email', async () => {
      const email = 'registered@example.com';
      await service.addToWaitlist(email);

      const result = await service.getWaitlistStatus(email);

      expect(result.email).toBe('registered@example.com');
      expect(result.isRegistered).toBe(true);
      expect(result.registeredAt).toBeDefined();
    });

    it('should return unregistered status for non-existing email', async () => {
      const email = 'notregistered@example.com';
      const result = await service.getWaitlistStatus(email);

      expect(result.email).toBe('notregistered@example.com');
      expect(result.isRegistered).toBe(false);
      expect(result.registeredAt).toBeUndefined();
    });

    it('should be case-insensitive when checking status', async () => {
      const email = 'Test@Example.com';
      await service.addToWaitlist(email);

      const result1 = await service.getWaitlistStatus('test@example.com');
      const result2 = await service.getWaitlistStatus('TEST@EXAMPLE.COM');

      expect(result1.isRegistered).toBe(true);
      expect(result2.isRegistered).toBe(true);
    });

    it('should normalize email when checking status', async () => {
      const email = '  spaced@example.com  ';
      await service.addToWaitlist('spaced@example.com');

      const result = await service.getWaitlistStatus(email);

      expect(result.email).toBe('spaced@example.com');
      expect(result.isRegistered).toBe(true);
    });
  });

  describe('getAllWaitlistEntries', () => {
    it('should return all waitlist entries', () => {
      const entries = service.getAllWaitlistEntries();
      expect(Array.isArray(entries)).toBe(true);
    });

    it('should return a copy of the waitlist array', async () => {
      await service.addToWaitlist('user1@example.com');
      await service.addToWaitlist('user2@example.com');

      const entries = service.getAllWaitlistEntries();
      expect(entries.length).toBeGreaterThanOrEqual(2);
      
      entries.push({ email: 'test', registeredAt: new Date() });
      const entriesAfter = service.getAllWaitlistEntries();
      expect(entriesAfter.length).toBe(entries.length - 1);
    });
  });
});