import { Field, InputType } from '@nestjs/graphql';
import { LanguageLevel } from '../entities/user.entity';

@InputType()
export class LanguageDto {
  @Field(() => LanguageLevel)
  level: LanguageLevel;

  @Field()
  language: string;
}
