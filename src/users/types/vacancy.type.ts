import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ErrorVacancy {
  @Field({ nullable: true })
  message?: string;
  @Field({ nullable: true })
  code?: string;
}

@ObjectType()
export class applyVacancyResponse {
  @Field({ nullable: true })
  message?: string;

  @Field(() => ErrorVacancy, { nullable: true })
  error?: ErrorVacancy;
}
