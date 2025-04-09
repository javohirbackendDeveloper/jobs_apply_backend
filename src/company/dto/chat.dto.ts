import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SendMessageDto {
  @Field()
  senderId: string;

  @Field()
  receiverId: string;

  @Field()
  content: string;
}
