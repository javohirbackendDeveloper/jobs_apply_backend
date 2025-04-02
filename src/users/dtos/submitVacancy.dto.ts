import { Field } from '@nestjs/graphql';

export class SubmitResumeDto {
  @Field()
  resume: string;

  @Field()
  vacancy_id: string;
}
