const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testPasswordVerification() {
    try {
        console.log('🔐 Testing password verification...\n');

        // Get the first user
        const user = await prisma.user.findFirst({
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
                role: true
            }
        });

        if (!user) {
            console.log('❌ No user found in database!');
            return;
        }

        console.log(`📧 Testing with user: ${user.email}`);
        console.log(`📛 Name: ${user.name}`);
        console.log(`👤 Role: ${user.role}`);
        console.log(`🔑 Stored password hash: ${user.password.substring(0, 20)}...`);
        console.log('');

        // Test common passwords
        const testPasswords = [
            'admin123',
            'Admin123',
            'password',
            'admin',
            '123456'
        ];

        console.log('Testing common passwords:');
        console.log('-'.repeat(50));

        for (const testPassword of testPasswords) {
            const isMatch = await bcrypt.compare(testPassword, user.password);
            console.log(`Password "${testPassword}": ${isMatch ? '✅ MATCH!' : '❌ No match'}`);
            if (isMatch) {
                console.log(`\n🎉 SUCCESS! The correct password is: "${testPassword}"`);
                console.log(`\n📝 Login credentials:`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Password: ${testPassword}`);
            }
        }

        console.log('\n' + '-'.repeat(50));
        console.log('\n💡 If none of these passwords match, you may need to:');
        console.log('   1. Reset the password using the seed API');
        console.log('   2. Create a new user account');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testPasswordVerification();
