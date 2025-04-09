import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ErrorChat {
  @Field({ nullable: true })
  message?: string;
  @Field({ nullable: true })
  code?: string;
}

@ObjectType()
export class sendMessageRes {
  @Field()
  message?: string;

  @Field(() => ErrorChat, { nullable: true })
  error?: ErrorChat;
}
@ObjectType()
export class Person {
  @Field()
  fullName: string;

  @Field({ nullable: true })
  profile_img?: string;

  @Field()
  id: string;
}

@ObjectType()
export class CompanyChats {
  @Field()
  id: string;

  @Field()
  receiverId: string;

  @Field()
  senderId: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;

  @Field(() => Person, { nullable: true })
  person?: Person;
}

@ObjectType()
export class GetCompanyChatsRes {
  @Field(() => [CompanyChats], { nullable: true })
  companyChats?: CompanyChats[];

  @Field(() => [Person], { nullable: true })
  receiver?: Person[];

  @Field(() => ErrorChat, { nullable: true })
  error?: ErrorChat;
}

@ObjectType()
export class Selected {
  @Field()
  id: string;
  @Field()
  fullName: string;
  @Field({ nullable: true })
  position?: string;
  @Field({ nullable: true })
  profile_img?: string;
}
@ObjectType()
export class GetSelectedRes {
  @Field(() => Selected, { nullable: true })
  selected?: Selected;

  @Field(() => ErrorChat, { nullable: true })
  error?: ErrorChat;
}

@ObjectType()
export class ChatMessageItems {
  @Field()
  id: string;

  @Field()
  senderId: string;

  @Field()
  receiverId: string;

  @Field()
  messageText: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class GetChatMessages {
  @Field(() => [ChatMessageItems], { nullable: true })
  companyChats?: ChatMessageItems[];

  @Field(() => ErrorChat, { nullable: true })
  error?: ErrorChat;
}
