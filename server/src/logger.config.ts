import * as winston from 'winston';
import 'winston-daily-rotate-file';

const consoleTransport = new winston.transports.Console({
    format: process.env.NODE_ENV === 'production'
        ? winston.format.combine(winston.format.timestamp(), winston.format.json())
        : winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, ms }) =>
                `[TamilFood] ${timestamp} ${level} [${context || 'App'}] ${message} ${ms}`),
        ),
});

export const loggerConfig = {
    transports: process.env.VERCEL === '1' ? [consoleTransport] : [
        consoleTransport,
        new winston.transports.DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '20m',
            maxFiles: '14d',
        }),
        new winston.transports.DailyRotateFile({
            filename: 'logs/combined-%DATE%.log',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
        }),
    ],
};
