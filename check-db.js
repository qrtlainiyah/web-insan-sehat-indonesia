const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
    try {
        console.log('🔍 Checking database connection...\n');

        // Test connection
        await prisma.$connect();
        console.log('✅ Database connected successfully!\n');

        // Count users
        const userCount = await prisma.user.count();
        console.log(`📊 Total users in database: ${userCount}\n`);

        if (userCount > 0) {
            // Get all users (without showing password hashes)
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true
                }
            });

            console.log('👥 Users in database:');
            users.forEach(user => {
                console.log(`  - ID: ${user.id}`);
                console.log(`    Email: ${user.email}`);
                console.log(`    Name: ${user.name}`);
                console.log(`    Role: ${user.role}`);
                console.log(`    Created: ${user.createdAt}`);
                console.log('');
            });

            // Check if passwords are hashed
            const firstUser = await prisma.user.findFirst({
                select: {
                    email: true,
                    password: true
                }
            });

            if (firstUser) {
                const isHashed = firstUser.password.startsWith('$2');
                console.log(`🔐 Password format check (${firstUser.email}):`);
                console.log(`    Is bcrypt hashed: ${isHashed ? '✅ Yes' : '❌ No (plain text!)'}`);
                console.log(`    Password starts with: ${firstUser.password.substring(0, 10)}...`);
            }
        } else {
            console.log('⚠️  No users found in database!');
            console.log('   You need to create a user account first.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'P1001') {
            console.error('\n💡 Database connection failed. Check your DATABASE_URL in .env file');
        }
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();
