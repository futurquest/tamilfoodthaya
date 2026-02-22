import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigService } from '@nestjs/config';

describe('Lead API (Integration)', () => {
    let app: INestApplication;
    let mongod: MongoMemoryServer;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(ConfigService)
            .useValue({
                get: (key: string) => {
                    if (key === 'MONGODB_URI') return uri;
                    return process.env[key];
                },
            })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        await mongod.stop();
    });

    it('/leads (POST) - should create a lead', () => {
        return request(app.getHttpServer())
            .post('/leads')
            .send({
                name: 'Test Lead',
                email: 'test@example.com',
                phone: '0612345678',
                eventDate: '2026-10-10',
                guests: '50',
                location: 'Amsterdam',
                message: 'Hello'
            })
            .expect(201);
    });

    it('/leads (POST) - should fail with invalid data', () => {
        return request(app.getHttpServer())
            .post('/leads')
            .send({
                name: '',
                email: 'invalid-email'
            })
            .expect(400);
    });
});
