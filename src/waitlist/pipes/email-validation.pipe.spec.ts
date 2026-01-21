import { BadRequestException } from '@nestjs/common';
import { EmailValidationPipe } from './email-validation.pipe';

describe('EmailValidationPipe', () => {
  let pipe: EmailValidationPipe;

  beforeEach(() => {
    pipe = new EmailValidationPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    it('should return valid email', async () => {
      const validEmail = 'test@example.com';
      const result = await pipe.transform(validEmail);
      expect(result).toBe(validEmail);
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example-domain.com',
        '123@example.com',
        'user@subdomain.example.com',
      ];

      for (const email of validEmails) {
        const result = await pipe.transform(email);
        expect(result).toBe(email);
      }
    });

    it('should throw BadRequestException for invalid email format', async () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user@.com',
        'user name@example.com',
        'user@example',
        '',
      ];

      for (const email of invalidEmails) {
        await expect(pipe.transform(email)).rejects.toThrow(
          BadRequestException,
        );
      }
    });

    it('should throw BadRequestException for null value', async () => {
      await expect(pipe.transform(null as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(pipe.transform(null as any)).rejects.toThrow(
        'Email is required and must be a string',
      );
    });

    it('should throw BadRequestException for undefined value', async () => {
      await expect(pipe.transform(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for non-string value', async () => {
      await expect(pipe.transform(123 as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(pipe.transform({} as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(pipe.transform([] as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should provide clear error message for invalid email', async () => {
      try {
        await pipe.transform('invalid-email');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toContain('email');
      }
    });
  });
});