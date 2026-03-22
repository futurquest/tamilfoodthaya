import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from './auth/schemas/user.schema';

async function deleteAllCustomers() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const userModel = app.get<Model<User>>(getModelToken(User.name));

    console.log('🔍 Checking for customers (users with role "user")...');
    
    const customerCount = await userModel.countDocuments({ role: UserRole.USER });
    console.log(`📊 Found ${customerCount} customer(s) to delete`);

    if (customerCount === 0) {
        console.log('✅ No customers found in database');
        await app.close();
        process.exit(0);
    }

    console.log('🗑️  Deleting all customers...');
    const result = await userModel.deleteMany({ role: UserRole.USER });
    
    console.log(`✅ Successfully deleted ${result.deletedCount} customer(s)`);
    
    // Show remaining users (admin/staff)
    const remainingUsers = await userModel.find().select('username email role').exec();
    console.log(`\n👥 Remaining users (${remainingUsers.length}):`);
    remainingUsers.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - Role: ${user.role}`);
    });

    await app.close();
    process.exit(0);
}

deleteAllCustomers().catch(err => {
    console.error('❌ Error deleting customers:', err);
    process.exit(1);
});
