import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userModel: any;
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
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should validate user correctly', async () => {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const mockUser = {
      username: 'admin',
      password: hashedPassword,
      toObject: jest.fn().mockReturnValue({ username: 'admin' }),
    };

    userModel.findOne.mockResolvedValue(mockUser);

    const result = await service.validateUser('admin', password);
    expect(result).toBeDefined();
    expect(result.username).toBe('admin');
  });

  it('should return null for invalid password', async () => {
    const mockUser = {
      username: 'admin',
      password: await bcrypt.hash('real-pass', 10),
    };
    userModel.findOne.mockResolvedValue(mockUser);

    const result = await service.validateUser('admin', 'wrong-pass');
    expect(result).toBeNull();
  });
});
