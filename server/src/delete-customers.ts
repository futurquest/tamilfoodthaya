import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserRole } from './auth/entities/user.entity';

async function deleteAllCustomers() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const userRepo = app.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));

    console.log('Checking for customers (users with role "user")...');

    const customerCount = await userRepo.count({ where: { role: UserRole.USER } });
    console.log(`Found ${customerCount} customer(s) to delete`);

    if (customerCount === 0) {
        console.log('No customers found in database');
        await app.close();
        process.exit(0);
    }

    console.log('Deleting all customers...');
    const result = await userRepo.delete({ role: UserRole.USER });

    console.log(`Successfully deleted ${result.affected ?? 0} customer(s)`);

    const remainingUsers = await userRepo.find({ select: { username: true, email: true, role: true } });
    console.log(`\nRemaining users (${remainingUsers.length}):`);
    remainingUsers.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - Role: ${user.role}`);
    });

    await app.close();
    process.exit(0);
}

deleteAllCustomers().catch(err => {
    console.error('Error deleting customers:', err);
    process.exit(1);
});