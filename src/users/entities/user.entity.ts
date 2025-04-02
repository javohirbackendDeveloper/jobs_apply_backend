import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum LanguageLevel {
  BEGINNER = 'beginner',
  PRE_INTERMEDIATE = 'pre_intermediate',
  INTERMEDIATE = 'intermediate',
  UPPER_INTERMEDIATE = 'upper_intermediate',
  ADVANCED = 'advanced',
  PROFICIENT = 'proficient',
  NATIVE = 'native',
}

registerEnumType(LanguageLevel, {
  name: 'LanguageLevel',
  description: 'User language proficiency levels',
});

export enum UserLevel {
  Junior = 'Junior',
  Middle = 'Middle',
  Senior = 'Senior',
}

registerEnumType(UserLevel, {
  name: 'UserLevel',
});

@ObjectType()
export class Education {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  degree: string;

  @Field()
  type_of_education: string;

  @Field()
  startDate: Date;

  @Field({ nullable: true })
  endDate: Date;
}

@ObjectType()
export class Language {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field(() => LanguageLevel)
  level: LanguageLevel;

  @Field()
  language: string;
}

@ObjectType()
export class Projects {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  project_title: string;

  @Field()
  description: string;

  @Field(() => [String])
  used_technologies: string[];
}

@ObjectType()
export class SocialMedia {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  platform: string;

  @Field()
  profile_link: string;
}

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  fullName: string;

  @Field()
  email: string;

  @Field(() => UserLevel, { defaultValue: 'Junior' })
  level?: UserLevel;

  @Field()
  password: string;

  @Field({ nullable: true })
  profile_img?: string;

  @Field(() => [String], { nullable: true })
  skills?: string[];

  @Field()
  position: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  experience?: Number;

  @Field(() => [String], { nullable: true })
  education?: string[];

  @Field(() => [String], { nullable: true })
  submitted_vacancies?: string[];

  @Field(() => [String], { nullable: true })
  certificates?: string[];

  @Field(() => [String], { nullable: true })
  projects?: string[];

  @Field(() => [Language], { nullable: true })
  languages?: Language[];

  @Field(() => [SocialMedia], { nullable: true })
  social_medias?: SocialMedia[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
