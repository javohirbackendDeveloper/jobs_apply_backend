import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class HardSkillError {
  @Field({ nullable: true })
  message?: string;
  @Field({ nullable: true })
  code?: string;
}

@ObjectType()
export class AddHardSkillResponse {
  @Field({ nullable: true })
  message?: string;

  @Field(() => HardSkillError, { nullable: true })
  error?: HardSkillError;
}

@ObjectType()
class TestItemres {
  @Field()
  id: string;

  @Field()
  question: string;

  @Field(() => [String])
  options: string[];

  @Field()
  correctAnswer: number;

  @Field()
  hardSkillTestsId: string;
}

@ObjectType()
export class GetHardSkillTestsRes {
  @Field(() => [TestItemres], { nullable: true })
  testItems?: TestItemres[];

  @Field(() => HardSkillError, { nullable: true })
  error?: HardSkillError;
}

@ObjectType()
export class ResolveHardSkillTestRes {
  @Field({ nullable: true })
  message?: string;

  @Field(() => HardSkillError, { nullable: true })
  error?: HardSkillError;
}
