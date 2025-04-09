import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import {
  ActivationResponse,
  ForgotPasswordResponse,
  LoginResponse,
  LogoutResponse,
  RegisterResponse,
  ResetPasswordResponse,
  UpdateProfileResponse,
} from './types/user.type';
import {
  ActivationDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  UpdateProfileDto,
} from './dtos/user.dto';
import { Request, Response } from 'express';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/user.guard';
import { UserEducationDto } from './dtos/userEducation';
import { AddEducationResponse } from './types/userEducation';
import { ProjectOfUserDto } from './dtos/ProjectsOfUser';
import { AddProjectResponse } from './types/project.type';
import { AddSoftSkillsResponse } from './types/softSkills.type';
import { SoftSkillsDto } from './dtos/softSkills.dto';
import {
  AddHardSkillResponse,
  GetHardSkillTestsRes,
  ResolveHardSkillTestRes,
} from './types/hardSkills.type';
import { HardSkillDto } from './dtos/HardSkills.dto';
import { CertificateDto } from './dtos/Certificates.dto';
import { AddCertificateResponse } from './types/ceritifcate.type';
import { LanguageDto } from './dtos/Language.type';
import { AddLanguageResponse } from './types/language';
import { UserSocialMediaDto } from './dtos/socialMedia';
import { AddSocialMediaResponse } from './types/socialMedia.type';
import {
  applyVacancyResponse,
  GetVacansiesResponseForUsers,
} from './types/vacancy.type';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => String)
  hello() {
    return 'Salom dunyo!';
  }

  @Mutation(() => RegisterResponse)
  async registerUser(
    @Args('registerDto') registerDto: RegisterDto,
  ): Promise<RegisterResponse> {
    console.log({ registerDto });

    if (
      !registerDto.fullName ||
      !registerDto.email ||
      !registerDto.password ||
      !registerDto.position
    ) {
      throw new BadRequestException('All field required');
    }
    const { activation_token } = await this.usersService.register(registerDto);
    return { activation_token };
  }

  @Mutation(() => ActivationResponse)
  async activateUser(
    @Args('activationDto') activationDto: ActivationDto,
    @Context() context: { res: Response },
  ): Promise<ActivationResponse> {
    return this.usersService.activateUser(activationDto, context.res);
  }

  @Mutation(() => LoginResponse)
  async login(@Args('loginDto') loginDto: LoginDto): Promise<LoginResponse> {
    return this.usersService.login(loginDto);
  }

  @Query(() => LoginResponse)
  @UseGuards(AuthGuard)
  async getLoggedInUser(@Context() context: { req: Request }) {
    return await this.usersService.getLoggedInUser(context.req);
  }

  @Query(() => LogoutResponse)
  @UseGuards(AuthGuard)
  async logout(@Context() context: { req: Request }) {
    return await this.usersService.logout(context.req);
  }

  @Mutation(() => ForgotPasswordResponse)
  async forgotPassword(
    @Args('forgotPasswordDto') forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ForgotPasswordResponse> {
    return this.usersService.forgotPasswordLink(forgotPasswordDto);
  }

  @Mutation(() => ResetPasswordResponse)
  async resetPassword(
    @Args('resetPasswordDto') resetPasswordDto: ResetPasswordDto,
  ): Promise<ResetPasswordResponse> {
    return this.usersService.resetPassword(resetPasswordDto);
  }

  @Mutation(() => UpdateProfileResponse)
  @UseGuards(AuthGuard)
  async updateProfile(
    @Args('updateProfileDto') updateProfileDto: UpdateProfileDto,
    @Context() context: { req: Request },
  ): Promise<UpdateProfileResponse> {
    return this.usersService.updateProfile(updateProfileDto, context.req);
  }

  // // EDUCATION

  @Mutation(() => AddEducationResponse)
  @UseGuards(AuthGuard)
  async addEducation(
    @Args('addEducation') addEducation: UserEducationDto,
    @Context() context: { req: Request },
  ): Promise<AddEducationResponse> {
    return this.usersService.addEducation(addEducation, context.req);
  }

  // PROJECTS OF USER

  @Mutation(() => AddProjectResponse)
  @UseGuards(AuthGuard)
  async addProject(
    @Args('addProjectDto') addProjectDto: ProjectOfUserDto,
    @Context() context: { req: Request },
  ): Promise<AddProjectResponse> {
    return this.usersService.addProject(addProjectDto, context.req);
  }

  // SOFT SKILLS
  @Mutation(() => AddSoftSkillsResponse)
  @UseGuards(AuthGuard)
  async addSoftSkill(
    @Args('addSoftSkillDto') addSoftSkillDto: SoftSkillsDto,
    @Context() context: { req: Request },
  ): Promise<AddSoftSkillsResponse> {
    return this.usersService.addSoftSkills(addSoftSkillDto, context.req);
  }

  // HARD SKILLS
  @Mutation(() => AddHardSkillResponse)
  @UseGuards(AuthGuard)
  async addHardSkill(
    @Args('addHardSkillDto') addHardSkillDto: HardSkillDto,
    @Context() context: { req: Request },
  ): Promise<AddHardSkillResponse> {
    return this.usersService.addHardSkills(addHardSkillDto, context.req);
  }

  // CERTIFICATE
  @Mutation(() => AddCertificateResponse)
  @UseGuards(AuthGuard)
  async addCertificate(
    @Args('addCertificateDto') addCertificateDto: CertificateDto,
    @Context() context: { req: Request },
  ): Promise<AddCertificateResponse> {
    return this.usersService.addCertificate(addCertificateDto, context.req);
  }

  // LANGUAGE
  @Mutation(() => AddLanguageResponse)
  @UseGuards(AuthGuard)
  async addLanguage(
    @Args('addLanguageDto') addLanguageDto: LanguageDto,
    @Context() context: { req: Request },
  ): Promise<AddLanguageResponse> {
    return this.usersService.addLanguage(addLanguageDto, context.req);
  }

  // SOCIAL MEDIA
  @Mutation(() => AddSocialMediaResponse)
  @UseGuards(AuthGuard)
  async addSocialMedia(
    @Args('addSocialMediaDto') addSocialMediaDto: UserSocialMediaDto,
    @Context() context: { req: Request },
  ): Promise<AddSocialMediaResponse> {
    return this.usersService.addSocialMedia(addSocialMediaDto, context.req);
  }

  // APPLY FOR THE VACANCY PART

  @Mutation(() => applyVacancyResponse)
  @UseGuards(AuthGuard)
  async applyVacancy(
    @Args('vacancyId') vacancyId: string,
    @Context() context: { req: Request },
  ): Promise<applyVacancyResponse> {
    return this.usersService.applyVacancy(vacancyId, context.req);
  }

  // RESOLVING HARD SKILL TESTS

  @Query(() => GetHardSkillTestsRes)
  async getHardSkillTests(
    @Args('vacancyId') vacancyId: string,
    @Args('hardSkillToken') hardSkillToken: string,
  ): Promise<GetHardSkillTestsRes> {
    return this.usersService.getVacancyTests(vacancyId, hardSkillToken);
  }

  @Mutation(() => ResolveHardSkillTestRes)
  @UseGuards(AuthGuard)
  async resolveHardSkilltests(
    @Args('answersFromUser', { type: () => [Number] })
    answersFromUser: number[],
    @Args('vacancyId') vacancyId: string,
    @Context() context: { req: Request },
  ): Promise<ResolveHardSkillTestRes> {
    return this.usersService.checkTests(
      answersFromUser,
      vacancyId,
      context.req,
    );
  }

  @Query(() => GetVacansiesResponseForUsers)
  async getVacansiesForUsers(): Promise<any> {
    const vacansies = await this.usersService.getVacansies();
    return { vacansies };
  }

  @Query(() => GetVacansiesResponseForUsers)
  async getVacansiesByPosition(
    @Args('position') position: string,
  ): Promise<any> {
    return this.usersService.searchVacansyByPosition(position);
  }
}
