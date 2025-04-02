import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum Role {
  Company = 'Company',
  Admin = 'Admin',
}

registerEnumType(Role, {
  name: 'Role',
});

export enum Level {
  Junior = 'Junior',
  Middle = 'Middle',
  Senior = 'Senior',
}

registerEnumType(Level, {
  name: 'Level',
});

@ObjectType()
export class Company {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  phone_number: string;

  @Field()
  location: string;

  @Field()
  company_name: string;

  @Field(() => Role, { defaultValue: Role.Company })
  role: Role;

  @Field(() => [String], { nullable: true })
  company_logo?: string[];

  @Field({ nullable: true })
  workers_number?: number;

  @Field({ nullable: true })
  organized_year?: number;

  @Field(() => [String], { nullable: true })
  social_networks?: string[];

  @Field(() => [String], { nullable: true })
  vacancies?: string[];

  @Field(() => [String], { nullable: true })
  projects?: string[];

  @Field(() => [String], { nullable: true })
  partners?: string[];

  @Field({ nullable: true })
  company_description?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class SocialNetwork {
  @Field()
  id: string;

  @Field()
  company_id: string;

  @Field({ nullable: true })
  platform?: string;

  @Field()
  profile_link: string;
}

@ObjectType()
export class Vacancy {
  @Field()
  id: string;

  @Field()
  company_id: string;

  @Field()
  position: string;

  @Field(() => Level, { nullable: true })
  level?: Level;

  @Field(() => [String], { defaultValue: [] })
  hard_requirements: string[];

  @Field(() => [String], { defaultValue: [] })
  soft_requirements: string[];

  @Field()
  work_start_hour: string;

  @Field()
  work_end_hour: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { defaultValue: [] })
  language_requirements?: string[];
}

@ObjectType()
export class Project {
  @Field()
  id: string;

  @Field()
  company_id: string;

  @Field()
  project_title: string;

  @Field()
  start_date: Date;

  @Field({ nullable: true })
  end_date: Date;

  @Field({ nullable: true })
  project_price?: number;

  @Field({ nullable: true })
  project_link?: string;

  @Field({ nullable: true })
  project_desc?: string;
}

@ObjectType()
export class Partner {
  @Field()
  id: string;

  @Field()
  company_id: string;

  @Field()
  partner_name: string;

  @Field()
  description: string;
}

// HARD SKILL TESTS

@ObjectType()
export class TestItem {
  @Field()
  question: string;

  @Field(() => [String])
  options: string[];

  @Field()
  correctAnswer: number;
}

@ObjectType()
export class Test {
  @Field()
  id: string;

  @Field()
  companyId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => [TestItem])
  tests: TestItem[];
}
