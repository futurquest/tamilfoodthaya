import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UserService } from './user.service';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UserRole } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

describe('admin user updates', () => {
    it('rejects non-allowlisted and invalid fields', async () => {
        const forbidden = plainToInstance(AdminUpdateUserDto, { role: UserRole.STAFF, password: 'injected' });
        const invalid = plainToInstance(AdminUpdateUserDto, { role: 'owner', isVerified: 'yes' });
        expect((await validate(forbidden, { whitelist: true, forbidNonWhitelisted: true })).map(error => error.property)).toContain('password');
        expect((await validate(invalid)).map(error => error.property)).toEqual(expect.arrayContaining(['role', 'isVerified']));
    });

    it('only assigns approved fields even when called with an unexpected object', async () => {
        const user = { _id: 'user-1', name: 'Old', phone: '123', role: UserRole.USER, isVerified: false, password: 'hashed', email: 'old@example.com' };
        const userRepo = {
            findOne: jest.fn().mockResolvedValue(user),
            save: jest.fn().mockImplementation(async (value: unknown) => value),
        };
        const service = new UserService(userRepo as any, {} as any, {} as any, {} as any);
        await service.adminUpdateUser('user-1', { name: 'New', role: UserRole.STAFF, password: 'injected', email: 'attacker@example.com' } as AdminUpdateUserDto);
        expect(userRepo.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'New', role: UserRole.STAFF, password: 'hashed', email: 'old@example.com' }));
    });
});

describe('self-service profile security', () => {
    it('rejects privileged fields and only applies the profile allowlist', async () => {
        const dto = plainToInstance(UpdateProfileDto, { name: 'New', role: 'admin', resetPasswordToken: 'attacker' });
        expect((await validate(dto, { whitelist: true, forbidNonWhitelisted: true })).map(error => error.property)).toEqual(expect.arrayContaining(['role', 'resetPasswordToken']));
        const user = { _id: 'user-1', name: 'Old', role: UserRole.USER, password: 'hashed', resetPasswordToken: null };
        const repo = { findOne: jest.fn().mockResolvedValue(user), save: jest.fn().mockImplementation(async (value: unknown) => value) };
        const service = new UserService(repo as any, {} as any, {} as any, {} as any);
        await service.updateProfile('user-1', { name: 'New', role: UserRole.ADMIN, resetPasswordToken: 'attacker' } as UpdateProfileDto);
        expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'New', role: UserRole.USER, resetPasswordToken: null }));
    });

    it('does not return all orders when the user disappears during dashboard loading', async () => {
        const repo = { findOne: jest.fn().mockResolvedValue(null) };
        const orders = { find: jest.fn() };
        const service = new UserService(repo as any, orders as any, orders as any, {} as any);
        await expect(service.getDashboardData('missing')).rejects.toThrow('User not found');
        expect(orders.find).not.toHaveBeenCalled();
    });

    it('does not claim guest orders by email for an unverified user', async () => {
        const repo = { findOne: jest.fn().mockResolvedValue({ _id: 'user-1', email: 'victim@example.com', isVerified: false }) };
        const orders = { find: jest.fn().mockResolvedValue([]), createQueryBuilder: jest.fn() };
        const notifications = { find: jest.fn().mockResolvedValue([]) };
        const service = new UserService(repo as any, orders as any, orders as any, notifications as any);
        await service.getDashboardData('user-1');
        expect(orders.find).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'user-1' } }));
        expect(orders.createQueryBuilder).not.toHaveBeenCalled();
    });
});
