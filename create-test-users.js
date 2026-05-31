const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUsers() {
    try {
        console.log('\n=== MEMBUAT USER TESTING ===\n');

        // Hash password
        const password = await bcrypt.hash('password123', 10);

        // Create ADMIN user
        const admin = await prisma.user.upsert({
            where: { email: 'admin@test.com' },
            update: {},
            create: {
                email: 'admin@test.com',
                name: 'Admin User',
                password: password,
                role: 'ADMIN'
            }
        });

        console.log('✅ Admin user created/updated:');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: password123`);
        console.log(`   Role: ${admin.role}\n`);

        // Create STAFF user
        const staff = await prisma.user.upsert({
            where: { email: 'staff@test.com' },
            update: {},
            create: {
                email: 'staff@test.com',
                name: 'Staff User',
                password: password,
                role: 'STAFF'
            }
        });

        console.log('✅ Staff user created/updated:');
        console.log(`   Email: ${staff.email}`);
        console.log(`   Password: password123`);
        console.log(`   Role: ${staff.role}\n`);

        console.log('=== USER TESTING SIAP DIGUNAKAN ===\n');
        console.log('Silakan login menggunakan kredensial di atas untuk testing RBAC\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestUsers();
