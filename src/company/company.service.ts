import {
  BadRequestException,
  Injectable,
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

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PrismaService,
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
      `/reset-password?verify=${forgotPasswordToken}`;

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
      throw new BadRequestException('Please give the company_id');
    }
    const vacancy = await this.prisma.vacansies.findUnique({
      where: { id: vacansy_id },
    });

    if (!vacancy) {
      throw new BadRequestException('This vacancy not found');
    }

    return vacancy;
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
}
