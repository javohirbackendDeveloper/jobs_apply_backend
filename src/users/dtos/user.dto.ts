import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class RegisterDto {
  @Field()
  @IsString({ message: 'full name must be string' })
  @IsNotEmpty({ message: 'full name is required' })
  fullName: string;

  @Field()
  @IsEmail({}, { message: 'Email must be valid' })
  @IsString({ message: 'email must be string' })
  @IsNotEmpty({ message: 'email is required' })
  email: string;

  @Field()
  @MinLength(8, { message: 'Password must be at least 8' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @Field()
  @IsNotEmpty({ message: 'Position is required' })
  position: string;
}

@InputType()
export class ActivationDto {
  @Field()
  @IsNotEmpty({ message: 'Activation token is required' })
  activationToken: string;

  @Field()
  @IsNotEmpty({ message: 'Activation code is required' })
  activationCode: string;
}

@InputType()
export class LoginDto {
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
export class ForgotPasswordDto {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

@InputType()
export class ResetPasswordDto {
  @Field()
  @IsNotEmpty({ message: 'Activation token is required' })
  activationToken: string;

  @Field()
  @MinLength(8, { message: 'Password must be more than 8' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

@InputType()
export class UpdateProfileDto {
  @Field({ nullable: true })
  fullName?: string;

  @Field({ nullable: true })
  position?: string;

  @Field({ nullable: true })
  about?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  experience?: number;
}
