import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailsService {
  constructor(private readonly mailerService: MailerService) {}
  async sendEmail(email: string, subject: string, template: string, context: any) {
    await this.mailerService.sendMail({
      to: email,
      subject: subject,
      template: template,
      context: context,
    });
  }
}
