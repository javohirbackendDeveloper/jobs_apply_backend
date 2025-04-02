import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ErrorCreateHardSkillTest {
  @Field({ nullable: true })
  message?: string;
  @Field({ nullable: true })
  code?: string;
}

@ObjectType()
export class CreateHardSkillTestResponse {
  @Field()
  message: string;

  @Field(() => ErrorCreateHardSkillTest, { nullable: true })
  error?: ErrorCreateHardSkillTest;
}
