import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CompanyService } from './company.service';
import {
  ActivationCompanyResponse,
  CreateVacansyResponse,
  DeleteVacancyReponse,
  ForgotPasswordCompanyResponse,
  GetOneVacancyResponse,
  GetSubmittedUsersRes,
  GetVacansiesResponse,
  LoginCompanyResponse,
  LogoutCompanyResponse,
  RegisterCompanyRes,
  ResetPasswordCompanyResponse,
  UpdateVacancyResponse,
} from './types/company.types';
import {
  ActivationCompanyDto,
  ForgotPasswordCompanyDto,
  LoginCompanyDto,
  RegisterCompanyDto,
} from './dto/company.dto';
import { Request, Response } from 'express';
import { UseGuards } from '@nestjs/common';
import { CompanyGuard } from 'src/guards/company.guard';
import { ResetPasswordDto } from 'src/users/dtos/user.dto';
import {
  CreateVacancyDto,
  HardSkillTestsDto,
  UpdateVacancyDto,
} from './dto/announcement.dto';
import { UsersService } from 'src/users/users.service';
import { CreateHardSkillTestResponse } from './types/CreateTestResponse';
import {
  GetChatMessages,
  GetCompanyChatsRes,
  GetSelectedRes,
  sendMessageRes,
} from './types/chat.tyoes';
import { SendMessageDto } from './dto/chat.dto';

@Resolver()
export class CompanyResolver {
  constructor(private readonly companyService: CompanyService) {}
  @Mutation(() => RegisterCompanyRes)
  async registerCompany(
    @Args('registerCompanyDto') registerCompanyDto: RegisterCompanyDto,
    @Context() context: { res: Response },
  ): Promise<RegisterCompanyRes> {
    const { activationToken } = await this.companyService.registerCompany(
      registerCompanyDto,
      context.res,
    );

    return { activationToken };
  }

  @Mutation(() => ActivationCompanyResponse)
  async activateCompany(
    @Args('activationCompanyDto') activationCompanyDto: ActivationCompanyDto,
    @Context() context: { res: Response },
  ): Promise<ActivationCompanyResponse> {
    return this.companyService.activateCompany(
      activationCompanyDto,
      context.res,
    );
  }

  @Mutation(() => LoginCompanyResponse)
  async loginCompany(
    @Args('loginCompanyDto') loginCompanyDto: LoginCompanyDto,
  ): Promise<LoginCompanyResponse> {
    return this.companyService.login(loginCompanyDto);
  }

  @Query(() => LoginCompanyResponse)
  @UseGuards(CompanyGuard)
  async getLoggedCompany(
    @Context() context: { req: Request },
  ): Promise<LoginCompanyResponse> {
    return await this.companyService.getLoggedInCompany(context.req);
  }

  @Mutation(() => LogoutCompanyResponse)
  @UseGuards(CompanyGuard)
  async logoutCompany(
    @Context() context: { req: Request },
  ): Promise<LogoutCompanyResponse> {
    return await this.companyService.logout(context.req);
  }

  @Mutation(() => ForgotPasswordCompanyResponse)
  async forgotPasswordCompany(
    @Args('forgotPasswordDto') forgotPasswordDto: ForgotPasswordCompanyDto,
  ): Promise<ForgotPasswordCompanyResponse> {
    return this.companyService.forgotPasswordLink(forgotPasswordDto);
  }

  @Mutation(() => ResetPasswordCompanyResponse)
  async resetCompanyPassword(
    @Args('resetPasswordDto') resetPasswordDto: ResetPasswordDto,
  ): Promise<ResetPasswordCompanyResponse> {
    return this.companyService.resetCompanyPassword(resetPasswordDto);
  }

  @Mutation(() => CreateVacansyResponse)
  @UseGuards(CompanyGuard)
  async createVacancy(
    @Args('createVacancyDto') createVacancyDto: CreateVacancyDto,
    @Context() context: { req: Request },
  ): Promise<CreateVacansyResponse> {
    return await this.companyService.createVacansy(
      createVacancyDto,
      context.req,
    );
  }

  @Query(() => GetVacansiesResponse)
  async getVacansies(@Args('company_id') company_id: String): Promise<any> {
    return this.companyService.getAllVacansies(company_id.toString());
  }

  @Query(() => GetOneVacancyResponse)
  async getOneVacancy(@Args('vacancy_id') vacancy_id: string): Promise<any> {
    return this.companyService.getOneVacancy(vacancy_id);
  }

  @Mutation(() => UpdateVacancyResponse)
  @UseGuards(CompanyGuard)
  async updateVacancy(
    @Args('vacany_id') vacancy_id: string,
    @Args('vacanyDto') vacancyDto: UpdateVacancyDto,
  ): Promise<any> {
    const vacancy = await this.companyService.updateVacancy(
      vacancyDto,
      vacancy_id,
    );
    return { vacancy };
  }

  @Mutation(() => DeleteVacancyReponse)
  @UseGuards(CompanyGuard)
  async deleteVacancy(
    @Args('vacany_id') vacancy_id: string,
    @Context() context: { req: Request },
  ): Promise<DeleteVacancyReponse> {
    return this.companyService.deleteVacancy(vacancy_id, context.req);
  }

  //  HARD SKILLS PART

  @Mutation(() => CreateHardSkillTestResponse)
  @UseGuards(CompanyGuard)
  async addHardSkillTests(
    @Args('tests') tests: HardSkillTestsDto,
    @Context() context: { req: Request },
  ): Promise<CreateHardSkillTestResponse> {
    return this.companyService.addHardSkillTests(tests, context.req);
  }

  // GET CANDIDATE'S DATAS WHO ARE APPLIED FOR VACANCY

  @Query(() => GetSubmittedUsersRes)
  async getSubmittedCandidates(
    @Args('vacancyId') vacancyId: string,
  ): Promise<any> {
    return this.companyService.getSUbmittedCandidates(vacancyId);
  }

  @Query(() => GetSubmittedUsersRes)
  async getPassedToHardSkills(
    @Args('vacancyId') vacancyId: string,
  ): Promise<any> {
    return this.companyService.getPassedToHardSkill(vacancyId);
  }

  @Query(() => GetSubmittedUsersRes)
  async getPassedToSoftSkills(
    @Args('vacancyId') vacancyId: string,
  ): Promise<any> {
    return this.companyService.getPassedToSoftSkill(vacancyId);
  }

  // CHATTING WITH CANDIDATES WHO PASSED TO SOFT SKILLS PART

  @Mutation(() => sendMessageRes)
  async sendMessageAsCompany(
    @Args('sendMessageDto') sendMessageDto: SendMessageDto,
  ): Promise<sendMessageRes> {
    return this.companyService.sendMessage(sendMessageDto);
  }
  @Query(() => GetSelectedRes)
  async getSelected(
    @Args('selectedId') selectedId: string,
  ): Promise<GetSelectedRes> {
    return this.companyService.getSelectedUser(selectedId);
  }

  @Query(() => GetCompanyChatsRes)
  async getCompanyChats(
    @Args('currentPersonId') currentPersonId: string,
  ): Promise<any> {
    return this.companyService.getChats(currentPersonId);
  }

  @Query(() => GetChatMessages)
  async getChatMessages(
    @Args('senderId') senderId: string,
    @Args('receiverId') receiverId: string,
  ): Promise<GetChatMessages> {
    return this.companyService.getChatMessages(senderId, receiverId);
  }
}
