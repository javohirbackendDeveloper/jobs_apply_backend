import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ErrorProject {
  @Field({ nullable: true })
  message?: string;
  @Field({ nullable: true })
  code?: string;
}

@ObjectType()
export class AddProjectResponse {
  @Field({ nullable: true })
  message?: string;

  @Field(() => ErrorProject, { nullable: true })
  error?: ErrorProject;
}
