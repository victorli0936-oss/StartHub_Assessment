import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { IsEmail, validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

class EmailDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;
}

@Injectable()
export class EmailValidationPipe implements PipeTransform<string, Promise<string>> {
  async transform(value: string): Promise<string> {
    if (!value || typeof value !== 'string') {
      throw new BadRequestException('Email is required and must be a string');
    }
    const emailDto = plainToClass(EmailDto, { email: value });
    const errors = await validate(emailDto);
    if (errors.length > 0) {
      const errorMessage = errors[0].constraints?.isEmail || 'Invalid email format';
      throw new BadRequestException(errorMessage);
    }
    return value;
  }
}