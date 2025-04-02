import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { EmailService } from 'src/email/email.service';

export class Compare_candidates {
  private candidateData: any;
  private vacancy_id: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    candidate: any,
    vacancyId: string,
  ) {
    this.candidateData = candidate;
    this.vacancy_id = vacancyId;
  }

  async generateToken(user: User) {
    const token = this.jwtService.sign(
      {
        user,
      },
      {
        secret: this.configService.get<string>('HARD_SKILL_TESTS_LINK'),
        expiresIn: '5m',
      },
    );

    return { token };
  }

  async compareLevel() {
    let allChecks = 0;
    let response = 2;
    const vacancy = await this.prisma.vacansies.findUnique({
      where: { id: this.vacancy_id },
    });

    if (!vacancy) {
      throw new NotFoundException('This vacancy not found with this id');
    }

    // POSITION CHECKER
    const comparePosition =
      vacancy.position.toLowerCase() ===
      this.candidateData?.position.toLowerCase();
    allChecks++;
    if (!comparePosition) {
      throw new BadRequestException('Vacancy and User positions is not math ');
    } else {
      response++;
    }

    // LEVEL CHECKER

    const compareLevel = vacancy.level === this.candidateData?.level;
    allChecks++;
    if (compareLevel) {
      response++;
    }

    // HARD REQUIREMENTS CHECKER

    if (
      this.candidateData.hard_skills?.length > 0 &&
      vacancy.soft_requirements?.length > 0
    ) {
      allChecks++;
      const similarSkillsNumber = vacancy.hard_requirements.filter((req) =>
        [...new Set(this.candidateData.hard_skills)].includes(req),
      ).length;
      if (
        similarSkillsNumber >=
        Math.floor((vacancy.hard_requirements.length * 70) / 100)
      ) {
        response++;
      }
    }

    // SOFT REQUIREMENTS CHECKER

    if (
      this.candidateData.soft_skills?.length > 0 &&
      vacancy.soft_requirements?.length > 0
    ) {
      allChecks++;
      const similarSkillsNumber = vacancy.soft_requirements.filter((req) =>
        [...new Set(this.candidateData.soft_skills)].includes(req),
      ).length;
      if (
        similarSkillsNumber >=
        Math.floor((vacancy.soft_requirements.length * 70) / 100)
      ) {
        response++;
      }
    }
    // CHECK LANGUAGE REQUIREMENTS

    if (vacancy.language_requirements?.length > 0) {
      allChecks++;
      let qualifiedNum = 0;
      const userLanguages = await this.prisma.language.findMany({
        where: { userId: this.candidateData.id },
      });

      if (userLanguages.length > 0) {
        for (let i = 0; i < userLanguages.length; i++) {
          let everyUserLanguages = userLanguages[i].language;

          if (vacancy.language_requirements.includes(everyUserLanguages)) {
            qualifiedNum++;
          }
        }
      }

      if (qualifiedNum >= vacancy.language_requirements.length * 0.7) {
        response++;
      }
    }

    // adding to passed hard skills part if user passed and sending message to email

    if (response >= allChecks * 0.7) {
      await this.prisma.vacansies.update({
        where: { id: vacancy.id },
        data: {
          passedToHardSkills: { push: this.candidateData.id },
        },
      });

      const token = this.generateToken(this.candidateData);

      const hardSkillTestsUrl =
        this.configService.get<string>('CLIENT_SIDE_URL') +
        `/hardSkillTests?solveTests=${token}`;

      await this.emailService.sendHardSkillUrl({
        subject: 'Pass hard skill test ',
        fullName: this.candidateData.fullName || this.candidateData.email,
        activationCode: hardSkillTestsUrl,
        template: './hard_skill_test',
        email: this.candidateData.email,
      });
    }
  }
}
