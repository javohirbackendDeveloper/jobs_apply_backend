import { Field, ObjectType } from '@nestjs/graphql';
import { Vacancy } from 'src/company/entities/company.entity';

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

@ObjectType()
export class GetVacansiesResponseForUsers {
  @Field(() => [Vacancy], { nullable: true })
  vacansies?: Vacancy[];

  @Field(() => ErrorVacancy, { nullable: true })
  error?: ErrorVacancy;
}
