import { Injectable, ConflictException } from '@nestjs/common';
import { WaitlistStatusDto } from './dto/waitlist-status.dto';

interface WaitlistEntry {
  email: string;
  registeredAt: Date;
}

@Injectable()
export class WaitlistService {
  private waitlist: WaitlistEntry[] = [];
  async addToWaitlist(email: string): Promise<WaitlistStatusDto> {
    const normalizedEmail = email.toLowerCase().trim();
    const existingEntry = this.waitlist.find(
      (entry) => entry.email === normalizedEmail,
    );
    if (existingEntry) {
      throw new ConflictException(
        `Email ${email} is already registered in the waitlist`,
      );
    }
    const newEntry: WaitlistEntry = {
      email: normalizedEmail,
      registeredAt: new Date(),
    };
    this.waitlist.push(newEntry);
    return {
      email: normalizedEmail,
      isRegistered: true,
      registeredAt: newEntry.registeredAt.toISOString(),
    };
  }
  async getWaitlistStatus(email: string): Promise<WaitlistStatusDto> {
    const normalizedEmail = email.toLowerCase().trim();
    const entry = this.waitlist.find(
      (entry) => entry.email === normalizedEmail,
    );
    return {
      email: normalizedEmail,
      isRegistered: !!entry,
      registeredAt: entry?.registeredAt.toISOString(),
    };
  }
  getAllWaitlistEntries(): WaitlistEntry[] {
    return [...this.waitlist];
  }
}