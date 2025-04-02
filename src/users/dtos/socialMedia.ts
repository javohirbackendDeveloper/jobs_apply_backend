import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserSocialMediaDto {
  @Field()
  platform: string;

  @Field()
  profile_link: string;
}
