import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ActivationCompanyDto,
  CompanyData,
  ForgotPasswordCompanyDto,
  LoginCompanyDto,
  RegisterCompanyDto,
  ResetCompanyPasswordDto,
} from './dto/company.dto';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/email/email.service';
import { Request, Response } from 'express';
import { TokenSenderCompany } from './utils/company.utils';
import { Company } from '@prisma/client';
import {
  CreateVacancyDto,
  HardSkillTestsDto,
  UpdateVacancyDto,
} from './dto/announcement.dto';
import { CompanyChats } from './types/chat.tyoes';
import { SendMessageDto } from './dto/chat.dto';
// import { ChatGateway } from 'src/chat/chat.provider';

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PrismaService,
    // // private readonly chatGateway: ChatGateway,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  // AUTHENTICATION CODES

  async registerCompany(
    registerCompany: RegisterCompanyDto,
    response: Response,
  ) {
    const { company_name, email, location, password, phone_number } =
      registerCompany;

    const companyWithEmail = await this.prisma.company.findUnique({
      where: { email },
    });

    if (companyWithEmail) {
      throw new BadRequestException('This email already exist with this email');
    }

    const companyWithName = await this.prisma.company.findUnique({
      where: { company_name },
    });

    if (companyWithName) {
      throw new BadRequestException('This email already exist with this email');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const company = {
      email,
      password: hashedPassword,
      phone_number,
      location,
      company_name,
    };
    const activationClass = await this.activationTOken(company);
    const activationCode = activationClass.activationCode;
    const activationToken = activationClass.token;

    await this.emailService.sendMailForCompany({
      email,

      subject: 'Activate your account',
      template: './activation-company-mail',
      company_name,
      activationCode,
    });

    return { activationToken, response };
  }

  async activationTOken(company: CompanyData) {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = this.jwtService.sign(
      {
        company,
        activationCode,
      },
      {
        secret: this.configService.get<string>('ACTIVATION_SECRET'),
        expiresIn: '5m',
      },
    );
    return { token, activationCode };
  }

  async activateCompany(
    activationDto: ActivationCompanyDto,
    response: Response,
  ) {
    const { activationCode, activationToken } = activationDto;

    const verifyToken = this.jwtService.verify(activationToken, {
      secret: this.configService.get<string>('ACTIVATION_SECRET'),
    });
    console.log(verifyToken.activationCode, activationCode);

    if (verifyToken.activationCode !== activationCode) {
      throw new UnauthorizedException('This activation code is invalid');
    }

    if (verifyToken.exp * 1000 < Date.now()) {
      throw new BadRequestException(
        'This token is expired please sign up  again',
      );
    }

    const company = await this.prisma.company.create({
      data: {
        ...verifyToken.company,
      },
    });

    return { company, response };
  }

  async login(loginDto: LoginCompanyDto) {
    const { email, password } = loginDto;

    const company = await this.prisma.company.findUnique({
      where: { email },
    });

    if (!company) {
      throw new UnauthorizedException('This company not found with this email');
    }

    const passwordChecker = await bcrypt.compare(password, company.password);

    if (!passwordChecker) {
      throw new UnauthorizedException('Invalid password');
    }

    const tokens = new TokenSenderCompany(this.jwtService, this.configService);

    return tokens.sendToken(company);
  }

  async getLoggedInCompany(req: any) {
    const accessToken = req.accesstoken;
    const refreshToken = req.refreshtoken;

    const company = req.company;
    return { company, accessToken, refreshToken };
  }

  async logout(req: any) {
    req.company = null;
    req.refreshtoken = null;
    req.accesstoken = null;

    return { message: 'Logout successfully' };
  }

  async generateToken(company: Company) {
    const token = this.jwtService.sign(
      {
        company,
      },
      {
        secret: this.configService.get<string>(
          'FORGOT_PASSWORD_COMPANY_SECRET',
        ),
        expiresIn: '5m',
      },
    );

    return { token };
  }

  async forgotPasswordLink(forgotPassword: ForgotPasswordCompanyDto) {
    const { email } = forgotPassword;

    const company = await this.prisma.company.findUnique({
      where: { email },
    });

    if (!company) {
      throw new BadRequestException('Company not found with this email');
    }

    const forgotPasswordToken = await this.generateToken(company);

    const resetPasswordUrl =
      this.configService.get<string>('CLIENT_SIDE_URL') +
      `/reset-password_company?verify=${forgotPasswordToken.token}`;

    await this.emailService.sendMailForCompany({
      email,
      subject: 'Reset your password',
      template: './forgot-password-company',
      company_name: company.company_name,
      activationCode: resetPasswordUrl,
    });

    return { message: 'Please check your email to reset your password' };
  }

  async resetCompanyPassword(resetPasswordDto: ResetCompanyPasswordDto) {
    const { password, activationToken } = resetPasswordDto;

    const decode = this.jwtService.decode(activationToken);

    if (!decode || decode.exp * 1000 < Date.now()) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const company = await this.prisma.company.update({
      where: { id: decode.company.id },
      data: { password: hashedPassword },
    });

    return { company };
  }

  // SHARING VACANCY FOR COMPANY

  async createVacansy(createVacancyDto: CreateVacancyDto, req: Request) {
    const company = req.company;
    if (!company || !company.id) {
      throw new UnauthorizedException('Please login again to continue');
    }
    const { hard_skill_tests } = createVacancyDto;

    const existTestNumber = await this.prisma.hardSkillTests.findFirst({
      where: { company_id: company.id, hardSkillNumber: hard_skill_tests },
    });

    if (!existTestNumber) {
      throw new BadRequestException(
        'You do not have this test with this test number ',
      );
    }

    const vacancy = await this.prisma.vacansies.create({
      data: {
        company_id: company.id,
        ...createVacancyDto,
      },
    });

    await this.prisma.company.update({
      where: { id: company.id },
      data: {
        vacancies: { push: vacancy.id },
      },
    });
    return { message: 'Vacancy created successfully' };
  }

  async getAllVacansies(company_id: string) {
    if (!company_id) {
      throw new BadRequestException('Please login again to continue');
    }

    const company = await this.prisma.company.findUnique({
      where: { id: company_id },
    });

    if (!company) {
      throw new BadRequestException('This company not found');
    }

    const vacansies = await this.prisma.vacansies.findMany({
      where: { company_id },
    });

    return { vacansies };
  }

  async getOneVacancy(vacansy_id: string) {
    if (!vacansy_id) {
      throw new BadRequestException('Please give the vacancy_id');
    }
    const vacancy = await this.prisma.vacansies.findUnique({
      where: { id: vacansy_id },
    });

    if (!vacancy) {
      throw new BadRequestException('This vacancy not found');
    }

    const company = await this.prisma.company.findUnique({
      where: { id: vacancy.company_id },
    });

    return { vacancy, company };
  }

  async updateVacancy(vacancyDto: UpdateVacancyDto, vacancy_id: string) {
    const vacancy = await this.prisma.vacansies.update({
      where: { id: vacancy_id },
      data: { ...vacancyDto },
    });

    if (!vacancy) {
      throw new BadRequestException('This vacancy not found');
    }

    return vacancy;
  }

  async deleteVacancy(vacancy_id: string, req: Request) {
    const company_id = req.company?.id;
    if (!company_id) {
      throw new UnauthorizedException('Please login again to continue');
    }

    const vacancy = await this.prisma.vacansies.delete({
      where: { id: vacancy_id, company_id },
    });

    if (!vacancy) {
      throw new BadRequestException('This vacancy not found');
    }

    return { message: 'Vacancy deleted successfully' };
  }

  //  HARD SKILL TESTS

  async addHardSkillTests(tests: HardSkillTestsDto, req: Request) {
    const company = req.company;

    const { name, hardSkillNumber, tests: testItems } = tests;
    if (!company || !company.id) {
      throw new UnauthorizedException('Please login again to continue');
    }

    const existTestNumber = await this.prisma.hardSkillTests.findFirst({
      where: { hardSkillNumber, company_id: company.id },
    });

    if (existTestNumber) {
      throw new BadRequestException('This test number already created');
    }

    const vacancy = await this.prisma.hardSkillTests.create({
      data: {
        name,
        hardSkillNumber,
        company_id: company?.id,
        tests: {
          create: testItems.map((item) => ({
            question: item.question,
            options: item.options,
            correctAnswer: item.correctAnswer,
          })),
        },
      },
    });

    return { message: 'Hard skills added succesfully' };
  }

  // GET CANDIDATE'S DATAS WHO ARE APPLIED FOR VACANCY

  async getSUbmittedCandidates(vacancyId: string) {
    const vacancy = await this.prisma.vacansies.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      throw new NotFoundException('This vacancy not found with this id');
    }

    const submitted_candidates_id = vacancy.submitted_candidates;

    const submitted_candidates = await this.prisma.user.findMany({
      where: { id: { in: submitted_candidates_id } },
    });

    return { candidates: submitted_candidates };
  }

  async getPassedToHardSkill(vacancyId: string) {
    const vacancy = await this.prisma.vacansies.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      throw new NotFoundException('This vacancy not found with this id');
    }

    const passed_hard_skills_candidates_id = vacancy.passedToHardSkills;

    const passedToHardSkills = await this.prisma.user.findMany({
      where: { id: { in: passed_hard_skills_candidates_id } },
    });

    return { candidates: passedToHardSkills };
  }

  async getPassedToSoftSkill(vacancyId: string) {
    const vacancy = await this.prisma.vacansies.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      throw new NotFoundException('This vacancy not found with this id');
    }

    const passedToSoftSkillsId = vacancy.passedToSoftSkills;

    const passedToSoftSkills = await this.prisma.user.findMany({
      where: { id: { in: passedToSoftSkillsId } },
    });

    return { candidates: passedToSoftSkills };
  }

  // CHATTING WITH PASSED TO SOFT SKILL PART

  async sendMessage(sendMessageDto: SendMessageDto) {
    const { content, receiverId, senderId } = sendMessageDto;

    const createdMessage = await this.prisma.message.create({
      data: {
        receiverId,
        messageText: content,
        senderId,
      },
    });

    return { message: 'Message sent successfully' };
  }

  async getChats(currentPersonId: string) {
    if (!currentPersonId) {
      throw new UnauthorizedException('Please login again to continue');
    }

    const allChats = await this.prisma.message.findMany({
      where: {
        OR: [{ receiverId: currentPersonId }, { senderId: currentPersonId }],
      },
      orderBy: { createdAt: 'desc' },
    });

    const uniqueChatsMap = new Map<string, (typeof allChats)[0]>();

    allChats.forEach((chat) => {
      const otherUserId =
        chat.receiverId === currentPersonId ? chat.senderId : chat.receiverId;

      if (!uniqueChatsMap.has(otherUserId)) {
        uniqueChatsMap.set(otherUserId, chat);
      }
    });

    const uniqueChats = Array.from(uniqueChatsMap.values());

    const chatsWithUsers = await Promise.all(
      uniqueChats.map(async (chat) => {
        let person;
        if (chat.senderId !== currentPersonId) {
          person = await this.prisma.user.findUnique({
            where: { id: chat.senderId },
          });
          if (!person) {
            person = await this.prisma.company.findUnique({
              where: { id: chat.senderId },
            });
          }
        } else if (chat.receiverId !== currentPersonId)
          person = await this.prisma.user.findUnique({
            where: { id: chat.receiverId },
          });

        if (!person) {
          person = await this.prisma.company.findUnique({
            where: { id: chat.receiverId },
          });
        }
        return {
          id: chat.id,
          receiverId: chat.receiverId || '',
          senderId: chat.senderId || '',
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,

          person: person
            ? {
                id: person.id,
                fullName: person.fullName || person.company_name || '',
                profile_img: person.profile_img || '',
              }
            : null,
        };
      }),
    );

    return {
      companyChats: chatsWithUsers,
    };
  }

  async getSelectedUser(selectedUserId: string) {
    let selected;
    selected = await this.prisma.user.findUnique({
      where: { id: selectedUserId },
    });

    if (!selected) {
      selected = await this.prisma.company.findUnique({
        where: { id: selectedUserId },
      });
    }

    if (!selected) {
      throw new NotFoundException('This person not found with this id');
    }
    return {
      selected: {
        id: selected.id,
        fullName: selected.fullName || selected.company_name,
        profileImg: selected.profile_img || selected.company_logo || '',
        position: selected?.position || '',
      },
    };
  }

  async getChatMessages(senderId: string, receiverId: string) {
    if (!senderId || !receiverId) {
      throw new NotFoundException('This id not found with this id');
    }
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          {
            receiverId: senderId,
            senderId: receiverId,
          },
          {
            receiverId: receiverId,
            senderId: senderId,
          },
        ],
      },
    });

    return {
      companyChats: messages.map((chat) => ({
        id: chat.id,
        receiverId: chat.receiverId || '',
        senderId: chat.senderId || '',
        messageText: chat?.messageText || '',
        imageUrl: chat?.imageUrl || '',
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt || '',
      })),
    };
  }
}
