import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { WaitlistService } from './waitlist.service';
import { WaitlistStatusDto } from './dto/waitlist-status.dto';
import { EmailValidationPipe } from './pipes/email-validation.pipe';

@Resolver(() => WaitlistStatusDto)
export class WaitlistResolver {
  constructor(private readonly waitlistService: WaitlistService) {}
  @Mutation(() => WaitlistStatusDto)
  async addToWaitlist(
    @Args('email', EmailValidationPipe) email: string,
  ): Promise<WaitlistStatusDto> {
    return this.waitlistService.addToWaitlist(email);
  }
  @Query(() => WaitlistStatusDto)
  async getWaitlistStatus(
    @Args('email', EmailValidationPipe) email: string,
  ): Promise<WaitlistStatusDto> {
    return this.waitlistService.getWaitlistStatus(email);
  }
}