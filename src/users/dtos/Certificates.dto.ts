import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CertificateDto {
  @Field()
  certificate_title: string;
  @Field({ nullable: true })
  description?: string;
  @Field()
  startDate: Date;
  @Field({ nullable: true })
  endDate?: Date;
}
