import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { Level, Vacancy } from '../entities/company.entity';

@InputType()
export class CreateVacancyDto {
  @Field()
  @IsString({ message: 'Position must be string' })
  position: string;

  @Field(() => Level, { defaultValue: 'Junior' })
  @IsString({ message: 'Level must be string' })
  level: Level;

  @Field(() => [String], { defaultValue: [] })
  @IsString({ message: 'Hard requirements must be string' })
  hard_requirements: string[];

  @Field(() => [String], { defaultValue: [] })
  @IsString({ message: 'Soft requirements must be string' })
  soft_requirements: string[];

  @Field()
  @IsString({ message: 'Work start time must be string' })
  work_start_hour: string;

  @Field()
  @IsString({ message: 'Work end time must be string' })
  work_end_hour: string;

  @Field({ nullable: true })
  @IsString({ message: 'Description must be string' })
  description?: string;

  @Field(() => [String], { nullable: true })
  language_requirements: string[];

  @Field({ nullable: true })
  hard_skill_tests: number;

  @Field({ nullable: true })
  soft_skill_tests: number;
}

@InputType()
export class UpdateVacancyDto {
  @Field(() => String, { nullable: true })
  position?: string;

  @Field(() => Level, { nullable: true })
  level?: Level;

  @Field(() => [String], { nullable: true })
  hard_requirements?: string[];

  @Field(() => [String], { nullable: true })
  soft_requirements?: string[];

  @Field(() => String, { nullable: true })
  work_start_hour?: string;

  @Field(() => String, { nullable: true })
  work_end_hour?: string;

  @Field(() => String, { nullable: true })
  description?: string;
}

@InputType()
export class TestItems {
  @Field()
  question: string;

  @Field(() => [String])
  options: string[];

  @Field()
  correctAnswer: number;
}

@InputType()
export class HardSkillTestsDto {
  @Field()
  name: string;

  @Field()
  hardSkillNumber: number;

  @Field(() => [TestItems])
  tests: TestItems[];
}
