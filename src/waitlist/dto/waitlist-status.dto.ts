import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class WaitlistStatusDto {
  @Field()
  email: string;
  @Field()
  isRegistered: boolean;
  @Field({ nullable: true })
  registeredAt?: string;
}