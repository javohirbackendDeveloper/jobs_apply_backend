import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Vacancy } from '../entities/company.entity';
import { Vacansies } from '@prisma/client';

export interface CompanyData {
  company_name: string;
  email: string;
  location: string;
  password: string;
  phone_number: string;
}

@InputType()
export class RegisterCompanyDto {
  @Field()
  @IsString({ message: 'Email must be string' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email is not email type' })
  email: string;

  @Field()
  @IsString({ message: 'Password must be string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be more than 8' })
  password: string;

  @Field()
  @IsString({ message: 'Company name must be string' })
  @IsNotEmpty({ message: 'Company name is required' })
  company_name: string;

  @Field()
  @IsString({ message: 'Phone number must be string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phone_number: string;

  @Field()
  @IsString({ message: 'Location must be string' })
  @IsNotEmpty({ message: 'Location is required' })
  location: string;
}

@InputType()
export class ActivationCompanyDto {
  @Field()
  @IsNotEmpty({ message: 'Activation token is required' })
  activationToken: string;

  @Field()
  @IsNotEmpty({ message: 'Activation code is required' })
  activationCode: string;
}

@InputType()
export class LoginCompanyDto {
  @Field()
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Field()
  @MinLength(8, { message: 'Password must be at least 8' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

@InputType()
export class ForgotPasswordCompanyDto {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

@InputType()
export class ResetCompanyPasswordDto {
  @Field()
  @IsNotEmpty({ message: 'Activation token is required' })
  activationToken: string;

  @Field()
  @MinLength(8, { message: 'Password must be more than 8' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
