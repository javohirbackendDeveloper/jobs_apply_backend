import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LanguageError {
  @Field({ nullable: true })
  message?: string;
  @Field({ nullable: true })
  code?: string;
}

@ObjectType()
export class AddLanguageResponse {
  @Field({ nullable: true })
  message?: string;

  @Field(() => LanguageError, { nullable: true })
  error?: LanguageError;
}
