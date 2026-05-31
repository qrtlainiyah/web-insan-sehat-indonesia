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

        const commissions = await prisma.commission.findMany({
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

        const userSummary = commissions.reduce((acc: any, commission) => {
            const userId = commission.userId;
            if (!acc[userId]) {
                acc[userId] = {
                    userId,
                    userName: commission.user.name,
                    userEmail: commission.user.email,
                    totalCommission: 0,
                    entryCount: 0,
                };
            }
            acc[userId].totalCommission += commission.amount;
            acc[userId].entryCount += 1;
            return acc;
        }, {});

        const summary = Object.values(userSummary);
        const totalCommission = commissions.reduce((sum, c) => sum + c.amount, 0);

        return NextResponse.json({
            month: targetMonth,
            year: targetYear,
            summary,
            totalCommission,
            totalEntries: commissions.length,
        });
    } catch (error) {
        console.error("Error fetching commission summary:", error);
        return NextResponse.json(
            { error: "Failed to fetch commission summary" },
            { status: 500 }
        );
    }
}
