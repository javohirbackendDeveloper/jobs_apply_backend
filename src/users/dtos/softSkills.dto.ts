import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SoftSkillsDto {
  @Field(() => [String])
  type: string[];
}
