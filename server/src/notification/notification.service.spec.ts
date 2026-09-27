import { Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';

describe('NotificationService credential hygiene', () => {
    it('does not log verification PINs or reset tokens in mock email mode', async () => {
        const debug = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
        const config = { get: jest.fn((key: string, fallback?: string) => key === 'SMTP_USER' ? undefined : fallback) };
        const service = new NotificationService({} as any, config as any);
        try {
            await service.sendVerificationPin('customer@example.com', '123456');
            await service.sendPasswordResetToken('customer@example.com', 'secret-reset-token');
            const output = debug.mock.calls.map(call => call.join(' ')).join(' ');
            expect(output).not.toContain('123456');
            expect(output).not.toContain('secret-reset-token');
        } finally {
            debug.mockRestore();
        }
    });

    it('rejects production email when SMTP is not configured', async () => {
        const prior = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        const config = { get: jest.fn((key: string, fallback?: string) => key === 'SMTP_USER' ? undefined : fallback) };
        const service = new NotificationService({} as any, config as any);
        try {
            await expect(service.sendPasswordResetToken('customer@example.com', 'secret-reset-token')).rejects.toThrow('Email delivery is temporarily unavailable');
        } finally {
            if (prior === undefined) delete process.env.NODE_ENV;
            else process.env.NODE_ENV = prior;
        }
    });

    it('does not report SMTP transport failure as a successful email', async () => {
        const config = { get: jest.fn((key: string, fallback?: string) => key === 'SMTP_USER' ? 'configured@example.com' : fallback) };
        const service = new NotificationService({} as any, config as any);
        (service as any).transporter = { sendMail: jest.fn().mockRejectedValue(new Error('private SMTP detail')) };
        await expect(service.sendPasswordResetToken('customer@example.com', 'secret-reset-token')).rejects.toThrow('Email delivery is temporarily unavailable');
    });
});
