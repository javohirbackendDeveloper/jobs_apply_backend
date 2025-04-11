import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ActivationDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  UpdateProfileDto,
} from './dtos/user.dto';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { UserData } from './types/user.interface';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { TokenSender } from './utils/tokenSender';
import { v2 as cloudinary } from 'cloudinary';
import { UserEducationDto } from './dtos/userEducation';
import { ProjectOfUserDto } from './dtos/ProjectsOfUser';
import { SoftSkillsDto } from './dtos/softSkills.dto';
import { HardSkillDto } from './dtos/HardSkills.dto';
import { CertificateDto } from './dtos/Certificates.dto';
import { LanguageDto } from './dtos/Language.type';
import { UserSocialMediaDto } from './dtos/socialMedia';
import { Compare_candidates } from './utils/compare_candidated';
import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  // USER AUTHENTICATION PART

  async register(registerDto: RegisterDto) {
    const { fullName, email, password, position } = registerDto;

    const foundUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (foundUser) {
      throw new ConflictException('This user already exist with this email');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = {
      position,
      email,
      password: hashedPassword,
      fullName,
    };
    const activation_token_creater = await this.activationTOken(user);
    const activationCode = activation_token_creater.activationCode;
    const activation_token = activation_token_creater.token;

    await this.emailService.sendMail({
      email,
      subject: 'Activate your account',
      template: './activation-mail',
      fullName,
      activationCode,
    });

    return { activation_token };
  }

  async activationTOken(user: UserData) {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = this.jwtService.sign(
      {
        user,
        activationCode,
      },
      {
        secret: this.configService.get<string>('ACTIVATION_SECRET'),
        expiresIn: '5m',
      },
    );
    return { token, activationCode };
  }

  async activateUser(activationDto: ActivationDto, response: Response) {
    const { activationCode, activationToken } = activationDto;

    const verifyToken = this.jwtService.verify(activationToken, {
      secret: this.configService.get<string>('ACTIVATION_SECRET'),
    });

    if (verifyToken.activationCode != activationCode) {
      throw new UnauthorizedException('This activation code is invalid');
    }

    if (verifyToken.exp * 1000 < Date.now()) {
      throw new BadRequestException(
        'This token is expired please sign up  again',
      );
    }
    const user = await this.prisma.user.create({
      data: {
        ...verifyToken.user,
      },
    });

    return { user, response };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('This user not found with this email');
    }

    const passwordChecker = await bcrypt.compare(password, user.password);

    if (!passwordChecker) {
      throw new UnauthorizedException('Invalid password');
    }

    const tokens = new TokenSender(this.jwtService, this.configService);

    return tokens.sendToken(user);
  }

  async getLoggedInUser(req: any) {
    const accessToken = req.accesstoken;
    const refreshToken = req.refreshtoken;

    const user = req.user;
    return { user, accessToken, refreshToken };
  }

  async logout(req: any) {
    req.user = null;
    req.refreshtoken = null;
    req.accesstoken = null;

    return { message: 'Logout successfully' };
  }

  async generateToken(user: User) {
    const token = this.jwtService.sign(
      {
        user,
      },
      {
        secret: this.configService.get<string>('FORGOT_PASSWORD_SECRET'),
        expiresIn: '1d',
      },
    );

    return { token };
  }

  async forgotPasswordLink(forgotPassword: ForgotPasswordDto) {
    const { email } = forgotPassword;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found with this email');
    }

    const forgotPasswordToken = await this.generateToken(user);

    const resetPasswordUrl =
      this.configService.get<string>('CLIENT_SIDE_URL') +
      `/reset-password?verify=${forgotPasswordToken.token}`;

    await this.emailService.sendMail({
      email,
      subject: 'Reset your password',
      template: './forgot-password',
      fullName: user.fullName,
      activationCode: resetPasswordUrl,
    });

    return { message: 'Please check your email to reset your password' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { password, activationToken } = resetPasswordDto;

    const decode = await this.jwtService.decode(activationToken);

    if (!decode || decode.exp * 1000 < Date.now()) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.update({
      where: { id: decode.user.id },
      data: { password: hashedPassword },
    });

    return { user };
  }

  async updateProfile(updateProfileDto: UpdateProfileDto, req: Request) {
    const currentUser = req.user;

    if (!currentUser) {
      throw new UnauthorizedException('Please login again to continue');
    }

    const user = await this.prisma.user.update({
      where: { id: currentUser.id },
      data: { ...updateProfileDto },
    });

    return { user };
  }

  // UPDATING USER PROFILE PART

  // EDUCATION

  async addEducation(educationDto: UserEducationDto, req: Request) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Please login again to continue');
    }

    const education = await this.prisma.education.create({
      data: { userId: user.id, ...educationDto },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        education: { push: education.id },
      },
    });

    return { message: 'Education added successfully' };
  }

  // PROJECTS

  async addProject(projecDto: ProjectOfUserDto, req: Request) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Please login again to continue');
    }
    const project = await this.prisma.projectsOfUser.create({
      data: { userId: user.id, ...projecDto },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        projects: { push: project.id },
      },
    });

    return { message: 'Project added successfully' };
  }

  // SoftSkills

  async addSoftSkills(softSkillsDto: SoftSkillsDto, req: Request) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Please login again to continue');
    }
    const { type } = softSkillsDto;
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        soft_skills: { push: type },
      },
    });

    return { message: 'Soft Skill added successfully' };
  }

  // HARD SKILLS

  async addHardSkills(hardSkillDto: HardSkillDto, req: Request) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Please login again to continue');
    }
    const { type } = hardSkillDto;
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        hard_skills: { push: type },
      },
    });

    return { message: 'Hard Skill added successfully' };
  }

  // CERTIFICATE

  async addCertificate(certificateDto: CertificateDto, req: Request) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Please login again to continue');
    }
    const certificate = await this.prisma.certificates.create({
      data: { userId: user.id, ...certificateDto },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        certificates: {
          push: certificate.id,
        },
      },
    });
    return { message: 'Certificate  added successfully' };
  }

  // LANGUAGE

  async addLanguage(languageDto: LanguageDto, req: Request) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Please login again to continue');
    }
    const language = await this.prisma.language.create({
      data: { userId: user.id, ...languageDto },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        languages: {
          push: language.id,
        },
      },
    });
    return { message: 'Language  added successfully' };
  }

  // SOCIAL MEDIA

  async addSocialMedia(socialMediaDto: UserSocialMediaDto, req: Request) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Please login again to continue');
    }
    const socialMedia = await this.prisma.socialMedia.create({
      data: { userId: user.id, ...socialMediaDto },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        social_medias: {
          push: socialMedia.id,
        },
      },
    });
    return {
      message: `Sizning ${socialMedia.platform.toUpperCase()} sahifangiz muvaffaqiyatli qo'shildi `,
    };
  }

  // APPLY FOR THE VACANSIES

  async getVacansies() {
    const allVacansies = await this.prisma.vacansies.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return allVacansies;
  }

  async applyVacancy(vacancyId: string, req: Request) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user?.id },
    });

    if (!user) {
      throw new UnauthorizedException('Please login again to continue');
    }

    const vacancy = await this.prisma.vacansies.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      throw new NotFoundException('This vacancy not found with this id');
    }

    if (vacancy.submitted_candidates.includes(user.id)) {
      return { message: 'You already applied for this vacancy' };
    }
    const shareInfoToCompare = new Compare_candidates(
      this.prisma,
      this.jwtService,
      this.configService,
      this.emailService,
      user,
      vacancyId,
    );
    shareInfoToCompare.compareLevel();

    const updatedVacancy = await this.prisma.vacansies.update({
      where: { id: vacancyId },
      data: {
        submitted_candidates: { push: user.id },
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        submitted_vacancies: { push: vacancy.id },
      },
    });

    return {
      message:
        'Iltimos emailingizga qarang ,  emailingizga keyingi bosqich uchun xabar yuborildi ',
    };
  }

  async searchVacansyByPosition(position: string) {
    try {
      if (!position || position.trim() === '') {
        const allVacansies = await this.prisma.vacansies.findMany({
          orderBy: { createdAt: 'desc' },
        });
        return { vacansies: allVacansies };
      }

      const vacansies = await this.prisma.vacansies.findMany({
        where: {
          position: {
            contains: position,
            mode: 'insensitive',
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return { vacansies };
    } catch (error) {
      console.error('Error searching vacancies:', error);
      return {
        vacansies: [],
        error: 'Vakansiyalarni qidirishda xato yuz berdi',
      };
    }
  }
  // SOLVING HARD SKILL TESTS

  async getVacancyTests(vacancyId: string, hardSkillToken: string) {
    const decodedToken = await this.jwtService.decode(hardSkillToken);
    if (!decodedToken || decodedToken.exp * 1000 < Date.now()) {
      throw new BadRequestException('Siz testlarni ishlashga kechikdingiz');
    }

    const vacancy = await this.prisma.vacansies.findUnique({
      where: { id: vacancyId },
    });

    const testHeader = await this.prisma.hardSkillTests.findFirst({
      where: {
        company_id: vacancy?.company_id,
        hardSkillNumber: vacancy?.hard_skill_tests,
      },
    });

    if (!testHeader) {
      throw new NotFoundException('This test not found with this id');
    }

    const testItems = await this.prisma.testItem.findMany({
      where: { hardSkillTestsId: testHeader.id },
      orderBy: { id: 'asc' },
    });

    if (!testItems) {
      throw new NotFoundException('This test items not found ');
    }

    return { testItems, vacancy };
  }

  async generateTokenForSoftSkillTests(user: User) {
    const token = this.jwtService.sign(
      {
        user,
      },
      {
        secret: this.configService.get<string>('SOFT_SKILL_TESTS_LINK'),
        expiresIn: '1d',
      },
    );

    return { token };
  }

  async checkTests(answersFromUser: number[], vacancyId: string, req: Request) {
    const user = req.user;

    if (!user) {
      1;

      throw new UnauthorizedException('Please login again to continue');
    }

    const vacancy = await this.prisma.vacansies.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      1;
      throw new NotFoundException('This vacancy  not found');
    }

    if (!vacancy.passedToHardSkills.includes(user.id)) {
      1;
      throw new BadRequestException('You did not pass from first part');
    }

    if (vacancy.passedToSoftSkills.includes(user.id)) {
      1;
      throw new BadRequestException('You already resolved this tests');
    }
    const hardSkillTest = await this.prisma.hardSkillTests.findFirst({
      where: {
        company_id: vacancy.company_id,
        hardSkillNumber: vacancy.hard_skill_tests,
      },
    });
    const hardSkillTestsId = hardSkillTest?.id;

    const testItems = await this.prisma.testItem.findMany({
      where: { hardSkillTestsId },
      orderBy: { id: 'asc' },
    });

    if (!testItems.length) {
      1;
      throw new NotFoundException('This test items not found');
    }

    let answers = 0;

    const result = testItems.map((item, index) => {
      if (!answersFromUser[index]) {
        return;
      } else {
        if (item.correctAnswer === answersFromUser[index]) {
          answers++;
        }
      }
    });

    const tokenData = await this.generateTokenForSoftSkillTests(user);

    const activationCode =
      this.configService.get<string>('CLIENT_SIDE_URL') +
      `/softSkillTest?verify=${tokenData.token}`;
    if (answers < testItems.length * 0.7) {
      await this.emailService.hardSkillTestResponse({
        subject: 'Hard skill test response',
        fullName: user.fullName,
        email: user.email,
        template: './hardSkillTestErrorResponse',
      });
    } else {
      await this.emailService.hardSkillTestResponse({
        subject: 'Hard skill test response',
        fullName: user.fullName,
        email: user.email,
        template: './hardSkillTestResponse',
        activationCode,
      });

      await this.prisma.vacansies.update({
        where: { id: vacancyId },
        data: {
          passedToSoftSkills: { push: user.id },
        },
      });
    }
    return {
      message:
        'Please check your email, we sent response of your hard skill test ',
    };
  }
}
