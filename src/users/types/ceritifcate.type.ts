import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ErrorCertificate {
  @Field({ nullable: true })
  message?: string;
  @Field({ nullable: true })
  code?: string;
}

@ObjectType()
export class AddCertificateResponse {
  @Field({ nullable: true })
  message?: string;

  @Field(() => ErrorCertificate, { nullable: true })
  error?: ErrorCertificate;
}
