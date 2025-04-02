import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

type mailOptions = {
  subject: string;
  fullName: string;
  email: string;
  activationCode: string;
  template: string;
};

type mailOptionsForCompany = {
  subject: string;
  company_name: string;
  email: string;
  activationCode: string;
  template: string;
};

type hardSkillUrlOptions = {
  subject: string;
  fullName: string;
  email: string;
  activationCode: string;
  template: string;
};

type hardSkillTestOptions = {
  subject: string;
  fullName: string;
  email: string;
  activationCode?: string;
  template: string;
};
@Injectable()
export class EmailService {
  constructor(private readonly mailService: MailerService) {}

  async sendMail({
    subject,
    fullName,
    activationCode,
    template,
    email,
  }: mailOptions) {
    await this.mailService.sendMail({
      to: email,
      subject,
      template,
      context: {
        fullName,
        activationCode,
      },
    });
  }

  async sendMailForCompany({
    subject,
    company_name,
    activationCode,
    template,
    email,
  }: mailOptionsForCompany) {
    await this.mailService.sendMail({
      to: email,
      subject,
      template,
      context: {
        company_name,
        activationCode,
      },
    });
  }

  async sendHardSkillUrl({
    subject,
    fullName,
    activationCode,
    template,
    email,
  }: hardSkillUrlOptions) {
    await this.mailService.sendMail({
      to: email,
      subject,
      template,
      context: {
        fullName,
        activationCode,
      },
    });
  }

  async hardSkillTestResponse({
    subject,
    fullName,
    activationCode,
    template,
    email,
  }: hardSkillTestOptions) {
    await this.mailService.sendMail({
      to: email,
      subject,
      template,
      context: {
        fullName,
        activationCode,
      },
    });
  }
}
