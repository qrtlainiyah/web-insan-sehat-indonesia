const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const products = [
    {
        name: 'Vitamin',
        description: 'Suplemen vitamin untuk kesehatan',
        price: 2000,
        imageUrl: null
    },
    {
        name: 'Kelor (Moringa)',
        description: 'Produk kelor / moringa untuk kesehatan',
        price: 250000,
        imageUrl: null
    },
    {
        name: 'Uramax',
        description: 'Produk uramax',
        price: 225000,
        imageUrl: null
    },
    {
        name: 'Annora',
        description: 'Produk annora',
        price: 250000,
        imageUrl: null
    },
    {
        name: 'Alami',
        description: 'Produk alami',
        price: 250000,
        imageUrl: null
    },
    {
        name: 'SKL (Soklin)',
        description: 'Produk soklin untuk operasional',
        price: 0,
        imageUrl: null
    }
];

async function main() {
    console.log('🌱 Seeding products...');

    for (const product of products) {
        // Check if product already exists
        const existing = await prisma.product.findFirst({
            where: { name: product.name }
        });

        if (existing) {
            console.log(`⏭️  Product "${product.name}" already exists, skipping...`);
            continue;
        }

        const created = await prisma.product.create({
            data: product
        });

        console.log(`✅ Created product: ${created.name} (Rp ${created.price.toLocaleString('id-ID')})`);
    }

    console.log('\n✨ Seeding completed!');

    // Display all products
    const allProducts = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
    });

    console.log(`\n📦 Total products in database: ${allProducts.length}`);
    allProducts.forEach((p, index) => {
        console.log(`   ${index + 1}. ${p.name} - Rp ${p.price.toLocaleString('id-ID')}`);
    });
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
