import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserEducationDto {
  @Field()
  degree: string;

  @Field()
  field_of_study: string;

  @Field()
  institution: string;

  @Field()
  startDate: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  type_of_education?: string;

  @Field({ nullable: true })
  endDate?: string;
}
