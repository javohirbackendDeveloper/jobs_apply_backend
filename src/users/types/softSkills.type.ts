import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SoftSkillsError {
  @Field({ nullable: true })
  message?: string;
  @Field({ nullable: true })
  code?: string;
}

@ObjectType()
export class AddSoftSkillsResponse {
  @Field({ nullable: true })
  message?: string;

  @Field(() => SoftSkillsError, { nullable: true })
  error?: SoftSkillsError;
}
