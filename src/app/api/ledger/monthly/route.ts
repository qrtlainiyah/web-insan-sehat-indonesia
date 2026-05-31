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
        const year = searchParams.get("year");

        const targetYear = year ? parseInt(year) : new Date().getFullYear();

        const monthlyData = [];

        for (let month = 1; month <= 12; month++) {
            const ledgers = await prisma.ledger.findMany({
                where: {
                    month,
                    year: targetYear,
                },
                include: {
                    scheduler: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    presenter: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            const totalAmount = ledgers.reduce(
                (sum, ledger) => sum + ledger.penghasilan,
                0
            );

            const userCount = new Set(
                ledgers.flatMap((l) =>
                    [l.schedulerId, l.presenterId].filter((id): id is number => id !== null)
                )
            ).size;

            monthlyData.push({
                month,
                year: targetYear,
                totalAmount,
                entryCount: ledgers.length,
                userCount,
                entries: ledgers,
            });
        }

        return NextResponse.json({
            year: targetYear,
            months: monthlyData,
        });
    } catch (error) {
        console.error("Error fetching monthly ledger:", error);
        return NextResponse.json(
            { error: "Failed to fetch monthly ledger" },
            { status: 500 }
        );
    }
}
