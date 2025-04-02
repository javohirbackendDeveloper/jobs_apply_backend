import { Field, ObjectType } from '@nestjs/graphql';
import { Company, Vacancy } from '../entities/company.entity';
import { UpdateVacancyDto } from '../dto/announcement.dto';

@ObjectType()
export class ErrorCompany {
  @Field({ nullable: true })
  message?: string;
  @Field({ nullable: true })
  code?: string;
}

@ObjectType()
export class RegisterCompanyRes {
  @Field()
  activationToken: string;

  @Field(() => ErrorCompany, { nullable: true })
  error?: ErrorCompany;
}

@ObjectType()
export class ActivationCompanyResponse {
  @Field(() => Company)
  company: Company | unknown;

  @Field(() => ErrorCompany, { nullable: true })
  error?: ErrorCompany;
}

@ObjectType()
export class LoginCompanyResponse {
  @Field(() => Company, { nullable: true })
  company?: Company | {};

  @Field({ nullable: true })
  accessToken?: string;

  @Field({ nullable: true })
  refreshToken?: string;

  @Field(() => ErrorCompany, { nullable: true })
  error?: ErrorCompany;
}

@ObjectType()
export class LogoutCompanyResponse {
  @Field()
  message?: string;
}

@ObjectType()
export class ForgotPasswordCompanyResponse {
  @Field()
  message: string;

  @Field(() => ErrorCompany, { nullable: true })
  error?: ErrorCompany;
}

@ObjectType()
export class ResetPasswordCompanyResponse {
  @Field(() => Company)
  company: Company | any;

  @Field(() => ErrorCompany, { nullable: true })
  error?: ErrorCompany;
}

@ObjectType()
export class CreateVacansyResponse {
  @Field()
  message: string;

  @Field(() => ErrorCompany, { nullable: true })
  error?: ErrorCompany;
}

@ObjectType()
export class GetVacansiesResponse {
  @Field(() => [Vacancy])
  vacansies: Vacancy[];

  @Field(() => ErrorCompany, { nullable: true })
  error?: ErrorCompany;
}

@ObjectType()
export class GetOneVacancyResponse {
  @Field(() => Vacancy)
  vacancy: Vacancy | {};

  @Field(() => ErrorCompany, { nullable: true })
  error?: ErrorCompany;
}

@ObjectType()
export class DeleteVacancyReponse {
  @Field()
  message: string;

  @Field(() => ErrorCompany, { nullable: true })
  error?: ErrorCompany;
}

@ObjectType()
export class UpdateVacancyResponse {
  @Field(() => Vacancy, { nullable: true })
  vacancy: Vacancy;

  @Field(() => ErrorCompany, { nullable: true })
  error?: ErrorCompany;
}
