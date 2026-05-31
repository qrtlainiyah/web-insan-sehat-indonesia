import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const month = searchParams.get("month");
        const year = searchParams.get("year");

        const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
        const targetYear = year ? parseInt(year) : new Date().getFullYear();

        const ledgers = await prisma.ledger.findMany({
            where: {
                month: targetMonth,
                year: targetYear,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        const userSummary = ledgers.reduce((acc: any, ledger) => {
            const userId = ledger.userId;
            if (!acc[userId]) {
                acc[userId] = {
                    userId,
                    userName: ledger.user.name,
                    userEmail: ledger.user.email,
                    totalEarnings: 0,
                    entryCount: 0,
                };
            }
            acc[userId].totalEarnings += ledger.amount;
            acc[userId].entryCount += 1;
            return acc;
        }, {});

        const summary = Object.values(userSummary);

        return NextResponse.json({
            month: targetMonth,
            year: targetYear,
            summary,
            totalEntries: ledgers.length,
        });
    } catch (error) {
        console.error("Error fetching ledger summary:", error);
        return NextResponse.json(
            { error: "Failed to fetch ledger summary" },
            { status: 500 }
        );
    }
}
