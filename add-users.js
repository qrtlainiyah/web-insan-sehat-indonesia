const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addAllUsers() {
    try {
        console.log('🔧 Adding users for commission entries...\n');

        await prisma.$connect();
        console.log('✅ Database connected!\n');

        // Hash password for new users (default password: password123)
        const hashedPassword = await bcrypt.hash('password123', 10);

        const usersToCreate = [
            // Presenters
            {
                name: 'Habibah',
                email: 'habibah@insansehat.id',
                password: hashedPassword,
                role: 'STAFF'
            },
            {
                name: 'Leo',
                email: 'leo@insansehat.id',
                password: hashedPassword,
                role: 'STAFF'
            },
            {
                name: 'Awan',
                email: 'awan@insansehat.id',
                password: hashedPassword,
                role: 'STAFF'
            },
            // Schedulers (Penjadwal)
            {
                name: 'Guntur',
                email: 'guntur@insansehat.id',
                password: hashedPassword,
                role: 'STAFF'
            },
            {
                name: 'Rahman',
                email: 'rahman@insansehat.id',
                password: hashedPassword,
                role: 'STAFF'
            },
            {
                name: 'Arifin',
                email: 'arifin@insansehat.id',
                password: hashedPassword,
                role: 'STAFF'
            }
        ];

        // Check existing users
        const existingEmails = usersToCreate.map(u => u.email);
        const existingUsers = await prisma.user.findMany({
            where: {
                email: {
                    in: existingEmails
                }
            }
        });

        console.log(`Found ${existingUsers.length} existing users\n`);

        let created = 0;
        let skipped = 0;

        // Create users that don't exist yet
        for (const userData of usersToCreate) {
            const exists = existingUsers.find(u => u.email === userData.email);

            if (!exists) {
                const user = await prisma.user.create({
                    data: userData
                });
                console.log(`✅ Created: ${user.name} (${user.email})`);
                created++;
            } else {
                console.log(`⚠️  Already exists: ${userData.name} (${userData.email})`);
                skipped++;
            }
        }

        console.log(`\n✨ Done!`);
        console.log(`   Created: ${created} users`);
        console.log(`   Skipped: ${skipped} users (already exist)`);
        console.log('\n📝 Default password for all users: "password123"');
        console.log('\n👥 Users for Commission Entries:');
        console.log('   Presenters: Habibah, Leo, Awan');
        console.log('   Penjadwal: Guntur, Rahman, Arifin');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

addAllUsers();
