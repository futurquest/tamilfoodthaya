import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { NotificationLog, NotificationStatus } from './schemas/notification.schema';
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
        @InjectModel(NotificationLog.name) private notificationLogModel: Model<NotificationLog>,
        private configService: ConfigService,
    ) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST', 'smtp.ethereal.email'),
            port: this.configService.get<number>('SMTP_PORT', 587),
            secure: false, // true for 465, false for other ports
            auth: {
                user: this.configService.get<string>('SMTP_USER', 'mock_user'),
                pass: this.configService.get<string>('SMTP_PASS', 'mock_pass'),
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    @OnEvent('order.status.changed')
    async handleOrderStatusChangedEvent(payload: OrderStatusChangedEvent) {
        this.logger.log(`Received order.status.changed event for ${payload.orderId} to ${payload.newStatus}`);
        this.logger.log(`Processing status change notification for order ${payload.orderId} (Type: ${payload.orderType}, New Status: ${payload.newStatus})`);

        const eventId = `${payload.orderId}_status_${payload.newStatus}`;
        const clientUrl = this.configService.get<string>('CLIENT_URL', 'http://localhost:5173');
        const dashboardUrl = `${clientUrl}/dashboard`;

        // 1. Send Email
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

        // 2. Send WhatsApp
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
        // Idempotency check: Have we processed this eventId and type?
        try {
            const existingLog = await this.notificationLogModel.findOne({ eventId, type });
            if (existingLog && [NotificationStatus.SENT, NotificationStatus.PENDING].includes(existingLog.status)) {
                this.logger.log(`Notification ${type} for event ${eventId} already processed or pending.`);
                return;
            }

            // Create pending log or update failed log
            let log;
            if (existingLog) {
                existingLog.status = NotificationStatus.PENDING;
                existingLog.errorMessage = undefined;
                log = await existingLog.save();
            } else {
                log = await this.notificationLogModel.create({
                    eventId,
                    type,
                    payload,
                    status: NotificationStatus.PENDING,
                    userId: payload.userId,
                    referenceId: payload.orderId
                });
            }

            // Attempt delivery
            await sendFn();

            // Mark SENT
            log.status = NotificationStatus.SENT;
            await log.save();
            this.logger.log(`Notification ${type} for event ${eventId} SENT successfully.`);
        } catch (error) {
            this.logger.error(`Failed to send ${type} notification for event ${eventId}`, error);
            // Mark FAILED
            await this.notificationLogModel.findOneAndUpdate(
                { eventId, type },
                { status: NotificationStatus.FAILED, errorMessage: error.message }
            );
        }
    }

    async sendEmail(to: string, subject: string, text: string, html?: string) {
        const smtpUser = this.configService.get<string>('SMTP_USER');

        // Mocking if no account actually set up or still using default
        if (!smtpUser || smtpUser === 'mock_user' || smtpUser === 'your_email@gmail.com') {
            this.logger.debug(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
            this.logger.debug(`Text: ${text}`);
            if (html) this.logger.debug(`HTML Content length: ${html.length}`);
            return;
        }

        try {
            await this.transporter.sendMail({
                from: this.configService.get<string>('SMTP_FROM', '"Tamil Food Thaya" <noreply@tamilfoodthaya.com>'),
                to,
                subject,
                text,
                html,
            });
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}: ${error.message}`);
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

    private async sendWhatsApp(to: string, message: string) {
        // Mock WhatsApp integration
        this.logger.debug(`[MOCK WHATSAPP] To: ${to}, Message: ${message}`);
        return Promise.resolve();
    }

    async clearNotification(notificationId: string, userId: string) {
        return this.notificationLogModel.findOneAndUpdate(
            { _id: notificationId, userId },
            { isCleared: true },
            { new: true }
        ).exec();
    }
}
