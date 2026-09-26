import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { NotificationService } from '../notification/notification.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: any;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock-token') },
        },
        {
          provide: NotificationService,
          useValue: { sendVerificationPin: jest.fn() },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(UserEntity));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should validate user correctly', async () => {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const mockUser = {
      username: 'admin',
      password: hashedPassword,
      _id: '1',
      email: 'demo@example.com',
      name: 'Admin',
      phone: '123',
      role: 'admin',
    };

    userRepo.findOne.mockResolvedValue(mockUser);

    const result = await service.validateUser('admin', password);
    expect(result).toBeDefined();
    expect(result.username).toBe('admin');
  });

  it('should return null for invalid password', async () => {
    const mockUser = {
      username: 'admin',
      password: await bcrypt.hash('real-pass', 10),
    };
    userRepo.findOne.mockResolvedValue(mockUser);

    const result = await service.validateUser('admin', 'wrong-pass');
    expect(result).toBeNull();
  });
});