const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkJanuaryData() {
    try {
        console.log('\n=== CEK DATA JANUARI 2026 ===\n');

        // Get all entries from January 2026
        const januaryEntries = await prisma.ledger.findMany({
            where: {
                year: 2026,
                month: 1
            },
            select: {
                id: true,
                date: true,
                month: true,
                year: true,
                moringa60: true,
                moringa30: true,
                annora: true,
                alami: true,
                uramaxLaku: true,
            },
            orderBy: { date: 'asc' }
        });

        if (januaryEntries.length === 0) {
            console.log('❌ TIDAK ADA data di Januari 2026\n');
        } else {
            console.log(`✅ Ditemukan ${januaryEntries.length} entry di Januari 2026:\n`);

            let totalProducts = 0;
            januaryEntries.forEach((entry, index) => {
                const entryTotal = (entry.moringa60 || 0) + (entry.moringa30 || 0) +
                    (entry.annora || 0) + (entry.alami || 0) + (entry.uramaxLaku || 0);
                totalProducts += entryTotal;

                console.log(`${index + 1}. Tanggal: ${entry.date.toISOString().split('T')[0]}`);
                console.log(`   ID: ${entry.id}`);
                console.log(`   Moringa 60: ${entry.moringa60}, Moringa 30: ${entry.moringa30}`);
                console.log(`   Annora: ${entry.annora}, Alami: ${entry.alami}, Uramax: ${entry.uramaxLaku}`);
                console.log(`   TOTAL PRODUK: ${entryTotal}\n`);
            });

            console.log(`📊 TOTAL PRODUK JANUARI 2026: ${totalProducts} produk\n`);
        }

        // Also check all data for comparison
        const allYearData = await prisma.ledger.aggregate({
            where: { year: 2026 },
            _sum: {
                moringa60: true,
                moringa30: true,
                annora: true,
                alami: true,
                uramaxLaku: true
            },
            _count: true
        });

        const yearTotal = (allYearData._sum.moringa60 || 0) + (allYearData._sum.moringa30 || 0) +
            (allYearData._sum.annora || 0) + (allYearData._sum.alami || 0) +
            (allYearData._sum.uramaxLaku || 0);

        console.log('=== RINGKASAN TAHUN 2026 ===');
        console.log(`Total entry di database: ${allYearData._count} entry`);
        console.log(`Total produk tahun 2026: ${yearTotal} produk`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkJanuaryData();
