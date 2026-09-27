import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { NotificationService } from '../notification/notification.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto, ResetPasswordDto, VerifyEmailDto } from './dto/auth.dto';
import { Logger } from '@nestjs/common';
import { createHash } from 'crypto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: any;
  let jwtService: JwtService;
  let notificationService: { sendVerificationPin: jest.Mock; sendPasswordResetToken: jest.Mock };
  let configService: { get: jest.Mock };

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
          useValue: { sendVerificationPin: jest.fn(), sendPasswordResetToken: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(UserEntity));
    jwtService = module.get<JwtService>(JwtService);
    notificationService = module.get(NotificationService);
    configService = module.get(ConfigService);
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

  it('generates a six-digit cryptographic verification PIN and emails it', async () => {
    userRepo.findOne.mockResolvedValue(null);
    userRepo.create.mockImplementation((value: unknown) => value);
    userRepo.save.mockImplementation((value: unknown) => value);
    await service.register({ username: 'customer', email: 'customer@example.com', password: 'password123', name: 'Customer', phone: '123' });
    const pin = notificationService.sendVerificationPin.mock.calls[0][1];
    expect(pin).toMatch(/^\d{6}$/);
    expect(notificationService.sendVerificationPin).toHaveBeenCalledWith('customer@example.com', pin);
  });

  it('verifies a valid PIN once and clears it', async () => {
    const user = { email: 'customer@example.com', verificationPin: '123456', verificationPinExpires: new Date(Date.now() + 60000), isVerified: false };
    userRepo.findOne.mockResolvedValue(user);
    userRepo.save.mockImplementation((value: unknown) => value);
    await expect(service.verifyEmail(user.email, '123456')).resolves.toEqual({ message: 'Email verified successfully' });
    expect(userRepo.save).toHaveBeenCalledWith(expect.objectContaining({ isVerified: true, verificationPin: null, verificationPinExpires: null }));
  });

  it('rejects an expired verification PIN', async () => {
    userRepo.findOne.mockResolvedValue({ verificationPinExpires: new Date(Date.now() - 1000) });
    await expect(service.verifyEmail('customer@example.com', '123456')).rejects.toThrow('Invalid or expired PIN');
    expect(userRepo.save).not.toHaveBeenCalled();
  });

  it('generates a random password-reset token and sends it without logging it', async () => {
    const user = { email: 'customer@example.com' };
    userRepo.findOne.mockResolvedValue(user);
    userRepo.save.mockImplementation((value: unknown) => value);
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    try {
      const result = await service.forgotPassword(user.email);
      const token = notificationService.sendPasswordResetToken.mock.calls[0][1];
      expect(token).toMatch(/^[0-9a-f]{64}$/);
      expect(userRepo.save).toHaveBeenCalledWith(expect.objectContaining({ resetPasswordToken: `sha256:${createHash('sha256').update(token).digest('hex')}` }));
      expect(logSpy).not.toHaveBeenCalled();
      expect(result.message).not.toContain('console');
    } finally {
      logSpy.mockRestore();
    }
  });

  it('consumes a hashed reset token once and rejects reuse', async () => {
    const token = 'a'.repeat(64);
    const user = { _id: 'user-1', resetPasswordToken: `sha256:${createHash('sha256').update(token).digest('hex')}`, resetPasswordExpires: new Date(Date.now() + 60000) };
    userRepo.findOne.mockResolvedValue(user);
    userRepo.update.mockResolvedValueOnce({ affected: 1 }).mockResolvedValueOnce({ affected: 0 });
    await expect(service.resetPassword(token, 'new-password-123')).resolves.toEqual({ message: 'Password reset successful' });
    expect(userRepo.update).toHaveBeenCalledWith(expect.objectContaining({ _id: 'user-1', resetPasswordToken: user.resetPasswordToken }), expect.objectContaining({ resetPasswordToken: null, resetPasswordExpires: null }));
    await expect(service.resetPassword(token, 'new-password-123')).rejects.toThrow('Invalid or expired token');
  });

  it('accepts a still-valid legacy plaintext reset token during migration', async () => {
    const token = 'legacy-token';
    userRepo.findOne.mockResolvedValue({ _id: 'user-1', resetPasswordToken: token, resetPasswordExpires: new Date(Date.now() + 60000) });
    userRepo.update.mockResolvedValue({ affected: 1 });
    await expect(service.resetPassword(token, 'new-password-123')).resolves.toEqual({ message: 'Password reset successful' });
  });

  it('rejects expired reset tokens before changing the password', async () => {
    userRepo.findOne.mockResolvedValue({ _id: 'user-1', resetPasswordToken: 'expired', resetPasswordExpires: new Date(Date.now() - 1000) });
    await expect(service.resetPassword('expired', 'new-password-123')).rejects.toThrow('Invalid or expired token');
    expect(userRepo.update).not.toHaveBeenCalled();
  });

  it('requires a privately configured password before creating the initial admin', async () => {
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    userRepo.findOne.mockResolvedValue(null);
    try {
      await service.createInitialAdmin();
      expect(userRepo.save).not.toHaveBeenCalled();
      configService.get.mockReturnValue('private-password-123');
      userRepo.create.mockImplementation((value: unknown) => value);
      userRepo.save.mockImplementation((value: unknown) => value);
      await service.createInitialAdmin();
      expect(userRepo.save).toHaveBeenCalledWith(expect.objectContaining({ username: 'admin' }));
      expect(await bcrypt.compare('private-password-123', userRepo.save.mock.calls[0][0].password)).toBe(true);
      expect(logSpy.mock.calls.flat().join(' ')).not.toContain('private-password-123');
    } finally {
      logSpy.mockRestore();
    }
  });

  it('rejects passwords shorter than eight characters for registration and reset', async () => {
    const register = plainToInstance(RegisterDto, { username: 'customer', name: 'Customer', phone: '123', email: 'customer@example.com', password: 'short7!' });
    const reset = plainToInstance(ResetPasswordDto, { token: 'token', newPassword: 'short7!' });
    expect((await validate(register)).some((error) => error.property === 'password')).toBe(true);
    expect((await validate(reset)).some((error) => error.property === 'newPassword')).toBe(true);
  });

  it('requires a valid email and six-digit verification PIN', async () => {
    const invalid = plainToInstance(VerifyEmailDto, { email: 'not-an-email', pin: '1234' });
    expect((await validate(invalid)).map(error => error.property)).toEqual(expect.arrayContaining(['email', 'pin']));
  });
});
