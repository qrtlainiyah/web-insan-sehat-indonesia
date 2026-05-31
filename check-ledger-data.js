const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLedgerData() {
    try {
        // Get all ledger entries with product fields
        const entries = await prisma.ledger.findMany({
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

        console.log('\n=== ALL LEDGER ENTRIES ===\n');
        entries.forEach(entry => {
            const total = (entry.moringa60 || 0) + (entry.moringa30 || 0) +
                (entry.annora || 0) + (entry.alami || 0) + (entry.uramaxLaku || 0);
            console.log(`${entry.date.toISOString().split('T')[0]} (${entry.year}-${entry.month.toString().padStart(2, '0')}) - Total: ${total}`);
            console.log(`  M60: ${entry.moringa60}, M30: ${entry.moringa30}, Annora: ${entry.annora}, Alami: ${entry.alami}, Uramax: ${entry.uramaxLaku}`);
        });

        // Calculate yearly total (2026)
        const yearlyResult = await prisma.ledger.aggregate({
            where: { year: 2026 },
            _sum: {
                moringa60: true,
                moringa30: true,
                annora: true,
                alami: true,
                uramaxLaku: true
            }
        });
        const yearlyTotal = (yearlyResult._sum.moringa60 || 0) + (yearlyResult._sum.moringa30 || 0) +
            (yearlyResult._sum.annora || 0) + (yearlyResult._sum.alami || 0) +
            (yearlyResult._sum.uramaxLaku || 0);

        // Calculate monthly total (Feb 2026)
        const monthlyResult = await prisma.ledger.aggregate({
            where: { year: 2026, month: 2 },
            _sum: {
                moringa60: true,
                moringa30: true,
                annora: true,
                alami: true,
                uramaxLaku: true
            }
        });
        const monthlyTotal = (monthlyResult._sum.moringa60 || 0) + (monthlyResult._sum.moringa30 || 0) +
            (monthlyResult._sum.annora || 0) + (monthlyResult._sum.alami || 0) +
            (monthlyResult._sum.uramaxLaku || 0);

        console.log('\n=== SUMMARY ===');
        console.log(`Year 2026 Total: ${yearlyTotal} products`);
        console.log(`February 2026 Total: ${monthlyTotal} products`);
        console.log(`Difference: ${yearlyTotal - monthlyTotal} products`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLedgerData();
