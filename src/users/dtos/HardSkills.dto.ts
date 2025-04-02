import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class HardSkillDto {
  @Field(() => [String])
  type: string[];
}
