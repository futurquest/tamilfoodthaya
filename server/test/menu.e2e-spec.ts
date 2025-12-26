import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

describe('Menu API (Integration)', () => {
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

    it('/menu/categories (GET)', () => {
        return request(app.getHttpServer())
            .get('/menu/categories')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
            });
    });

    it('/menu/items (GET)', () => {
        return request(app.getHttpServer())
            .get('/menu/items')
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
            });
    });
});
