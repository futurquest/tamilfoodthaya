import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { NotificationLogEntity, NotificationStatus } from './entities/notification-log.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { getStatusUpdateTemplate, getVerificationEmailTemplate } from './templates';

interface OrderStatusChangedEvent {
    orderId: string;
    userId?: string;
    customerEmail: string;
    customerPhone: string;
    customerName: string;
    oldStatus: string;
    newStatus: string;
    orderType: 'catering' | 'regular';
}

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);
    private transporter: nodemailer.Transporter;

    constructor(
        @InjectRepository(NotificationLogEntity) private notificationRepo: Repository<NotificationLogEntity>,
        private configService: ConfigService,
    ) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST', 'smtp.ethereal.email'),
            port: this.configService.get<number>('SMTP_PORT', 587),
            secure: false,
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
            auth: {
                user: this.configService.get<string>('SMTP_USER', 'mock_user'),
                pass: this.configService.get<string>('SMTP_PASS', 'mock_pass'),
            },
        });
    }

    @OnEvent('order.status.changed')
    async handleOrderStatusChangedEvent(payload: OrderStatusChangedEvent) {
        this.logger.log(`Received order.status.changed event for ${payload.orderId} to ${payload.newStatus}`);
        this.logger.log(`Processing status change notification for order ${payload.orderId} (Type: ${payload.orderType}, New Status: ${payload.newStatus})`);

        const eventId = `${payload.orderId}_status_${payload.newStatus}`;
        const clientUrl = this.configService.get<string>('CLIENT_URL', 'http://localhost:5173');
        const dashboardUrl = `${clientUrl}/dashboard`;

        await this.dispatchNotification(
            eventId,
            'email',
            payload,
            async () => {
                const html = getStatusUpdateTemplate({
                    customerName: payload.customerName,
                    orderId: payload.orderId,
                    newStatus: payload.newStatus,
                    orderType: payload.orderType,
                    dashboardUrl,
                });

                await this.sendEmail(
                    payload.customerEmail,
                    `Update: Your ${payload.orderType} order is now ${payload.newStatus}`,
                    `Hi ${payload.customerName}, your ${payload.orderType} order ${payload.orderId} status is now ${payload.newStatus}.`,
                    html
                );
            }
        );

        await this.dispatchNotification(
            eventId,
            'whatsapp',
            payload,
            async () => {
                await this.sendWhatsApp(
                    payload.customerPhone,
                    `Hi ${payload.customerName}, your ${payload.orderType} order status is now ${payload.newStatus}. View details: ${dashboardUrl}`
                );
            }
        );
    }

    private async dispatchNotification(
        eventId: string,
        type: string,
        payload: any,
        sendFn: () => Promise<void>
    ) {
        try {
            const existingLog = await this.notificationRepo.findOne({ where: { eventId, type } });
            if (existingLog && [NotificationStatus.SENT, NotificationStatus.PENDING].includes(existingLog.status)) {
                this.logger.log(`Notification ${type} for event ${eventId} already processed or pending.`);
                return;
            }

            let log: NotificationLogEntity;
            if (existingLog) {
                existingLog.status = NotificationStatus.PENDING;
                existingLog.errorMessage = null;
                log = await this.notificationRepo.save(existingLog);
            } else {
                log = await this.notificationRepo.save(this.notificationRepo.create({
                    _id: NotificationLogEntity.newId(),
                    eventId,
                    type,
                    payload,
                    status: NotificationStatus.PENDING,
                    userId: payload.userId ?? null,
                    referenceId: payload.orderId ?? null,
                }));
            }

            await sendFn();

            log.status = NotificationStatus.SENT;
            await this.notificationRepo.save(log);
            this.logger.log(`Notification ${type} for event ${eventId} SENT successfully.`);
        } catch {
            this.logger.error(`Failed to send ${type} notification for event ${eventId}.`);
            await this.notificationRepo.update(
                { eventId, type },
                { status: NotificationStatus.FAILED, errorMessage: 'Notification delivery failed' }
            );
        }
    }

    async sendEmail(to: string, subject: string, text: string, html?: string) {
        const smtpUser = this.configService.get<string>('SMTP_USER');

        if (!smtpUser || smtpUser === 'mock_user' || smtpUser === 'your_email@gmail.com') {
            if (process.env.NODE_ENV === 'production') {
                this.logger.error('SMTP is not configured.');
                throw new ServiceUnavailableException('Email delivery is temporarily unavailable');
            }
            this.logger.debug('[MOCK EMAIL] Message not delivered.');
            return;
        }

        try {
            await this.transporter.sendMail({
                from: this.configService.get<string>('SMTP_FROM', '"demo" <demo@example.com>'),
                to,
                subject,
                text,
                html,
            });
        } catch {
            this.logger.error('SMTP email delivery failed.');
            throw new ServiceUnavailableException('Email delivery is temporarily unavailable');
        }
    }

    async sendVerificationPin(email: string, pin: string) {
        const html = getVerificationEmailTemplate(pin);
        await this.sendEmail(
            email,
            'Verify your Tamil Food Thaya Account',
            `Welcome! Your verification PIN is: ${pin}. This PIN expires in 1 hour.`,
            html
        );
    }

    async sendPasswordResetToken(email: string, token: string) {
        await this.sendEmail(
            email,
            'Reset your Tamil Food Thaya password',
            `Your password reset token is: ${token}. It expires in 1 hour. If you did not request this, you can ignore this email.`,
        );
    }

    private async sendWhatsApp(to: string, message: string) {
        this.logger.debug(`[MOCK WHATSAPP] To: ${to}, Message: ${message}`);
        return Promise.resolve();
    }

    async clearNotification(notificationId: string, userId: string) {
        const log = await this.notificationRepo.findOne({ where: { _id: notificationId, userId } });
        if (!log) {
            return null;
        }
        log.isCleared = true;
        return this.notificationRepo.save(log);
    }
}
