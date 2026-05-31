const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteJanuaryData() {
    try {
        console.log('\n=== MENGHAPUS DATA JANUARI 2026 ===\n');

        // First, show what will be deleted
        const januaryEntries = await prisma.ledger.findMany({
            where: {
                year: 2026,
                month: 1
            },
            select: {
                id: true,
                date: true,
                moringa60: true,
                moringa30: true,
                annora: true,
                alami: true,
                uramaxLaku: true,
            },
            orderBy: { date: 'asc' }
        });

        if (januaryEntries.length === 0) {
            console.log('❌ TIDAK ADA data di Januari 2026 untuk dihapus\n');
            return;
        }

        console.log(`⚠️  Akan menghapus ${januaryEntries.length} entry dari Januari 2026:\n`);

        let totalProducts = 0;
        januaryEntries.forEach((entry, index) => {
            const entryTotal = (entry.moringa60 || 0) + (entry.moringa30 || 0) +
                (entry.annora || 0) + (entry.alami || 0) + (entry.uramaxLaku || 0);
            totalProducts += entryTotal;

            console.log(`${index + 1}. ID: ${entry.id} | Tanggal: ${entry.date.toISOString().split('T')[0]} | Total: ${entryTotal} produk`);
        });

        console.log(`\n📊 Total produk yang akan dihapus: ${totalProducts} produk\n`);

        // DELETE the entries
        const deleteResult = await prisma.ledger.deleteMany({
            where: {
                year: 2026,
                month: 1
            }
        });

        console.log(`✅ BERHASIL menghapus ${deleteResult.count} entry dari Januari 2026\n`);

        // Verify deletion
        const remainingJan = await prisma.ledger.count({
            where: { year: 2026, month: 1 }
        });

        if (remainingJan === 0) {
            console.log('✓ Verifikasi: Tidak ada lagi data Januari 2026 di database\n');
        } else {
            console.log(`⚠️  Warning: Masih ada ${remainingJan} entry Januari di database\n`);
        }

        // Show new totals
        const newYearTotal = await prisma.ledger.aggregate({
            where: { year: 2026 },
            _sum: {
                moringa60: true,
                moringa30: true,
                annora: true,
                alami: true,
                uramaxLaku: true
            }
        });

        const yearTotal = (newYearTotal._sum.moringa60 || 0) + (newYearTotal._sum.moringa30 || 0) +
            (newYearTotal._sum.annora || 0) + (newYearTotal._sum.alami || 0) +
            (newYearTotal._sum.uramaxLaku || 0);

        console.log('=== RINGKASAN SETELAH PENGHAPUSAN ===');
        console.log(`Total produk tahun 2026 sekarang: ${yearTotal} produk`);
        console.log('\n💡 Refresh dashboard Anda untuk melihat perubahan!\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteJanuaryData();
