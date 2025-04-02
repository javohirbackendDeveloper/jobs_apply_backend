import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ErrorSocialMedia {
  @Field({ nullable: true })
  message?: string;
  @Field({ nullable: true })
  code?: string;
}

@ObjectType()
export class AddSocialMediaResponse {
  @Field({ nullable: true })
  message?: string;

  @Field(() => ErrorSocialMedia, { nullable: true })
  error?: ErrorSocialMedia;
}
