import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ErrorEducation {
  @Field({ nullable: true })
  message?: string;
  @Field({ nullable: true })
  code?: string;
}

@ObjectType()
export class AddEducationResponse {
  @Field({ nullable: true })
  message?: string;

  @Field(() => ErrorEducation, { nullable: true })
  error?: ErrorEducation;
}
