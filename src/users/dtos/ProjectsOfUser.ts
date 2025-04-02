import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ProjectOfUserDto {
  @Field()
  project_title: string;

  @Field(() => [String])
  used_technologies: string[];

  @Field()
  description: string;
}
