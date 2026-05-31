import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdmin() {
    try {
        // Delete existing admin account
        const deleted = await prisma.user.deleteMany({
            where: {
                email: 'insansehatindonesia@gmail.com'
            }
        });

        console.log(`✅ Deleted ${deleted.count} existing account(s)`);

        // Create new admin account with correct password
        const hashedPassword = await bcrypt.hash('ISI123', 10);

        const user = await prisma.user.create({
            data: {
                email: 'insansehatindonesia@gmail.com',
                name: 'Admin',
                password: hashedPassword,
                role: 'ADMIN',
            },
        });

        console.log('✅ Admin account created successfully!');
        console.log(`📧 Email: ${user.email}`);
        console.log(`🔑 Password: ISI123`);
        console.log(`👤 Role: ${user.role}`);
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdmin();
