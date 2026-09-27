import * as winston from 'winston';
import 'winston-daily-rotate-file';

export const loggerConfig = {
    transports: [
        new winston.transports.Console({
            format: process.env.NODE_ENV === 'production'
                ? winston.format.combine(winston.format.timestamp(), winston.format.json())
                : winston.format.combine(
                winston.format.timestamp(),
                winston.format.ms(),
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, context, ms }) => {
                    return `[TamilFood] ${timestamp} ${level} [${context || 'App'}] ${message} ${ms}`;
                }),
                ),
        }),
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
