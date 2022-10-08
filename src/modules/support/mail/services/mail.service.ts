import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { config } from 'src/config';
import { IAppUser } from 'src/modules/user/user/interfaces/user.interface';

@Injectable()
export class MailService {
	private logger = new Logger('MailService');

	constructor(
		@InjectQueue(config.mailQueueName)
		private readonly mailQueue: Queue,
	) {}

	async sendOtp(
		user: IAppUser,
		otp: number,
	): Promise<boolean> {
		try {
			await this.mailQueue.add('send-registered-user-email', { user, otp, });

			this.logger.log(
				`Added email "${user.email}" to send-otp-confirmation-email queue`,
			);

			return true;
		} catch (error) {
			this.logger.error(error);
			return false;
		}
	}

	async sendSuccessChangeEmail(
		user: IAppUser,
		otp: number,
		email?: string,
	): Promise<boolean> {
		try {
			await this.mailQueue.add('send-otp-update-email', { user, otp, email });

			this.logger.log(
				`Added email "${email}" to send-otp-update-email queue`,
			);

			return true;
		} catch (error) {
			this.logger.error(error);
			return false;
		}
	}

	async sendSuccessChangePassword(user: IAppUser): Promise<boolean> {
		try {
			await this.mailQueue.add('send-success-change-password', { user, }),
				this.logger.log(
					`Added email "${user.email}" to send-success-change-password queue`,
				);

			return true;
		} catch (error) {
			this.logger.error(error);
			return false;
		}
	}
}