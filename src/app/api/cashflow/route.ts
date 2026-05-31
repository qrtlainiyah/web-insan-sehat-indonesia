import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cashFlowSchema } from "@/lib/validations";
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

        // Only admin can access cashflow
        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const type = searchParams.get("type");

        const where: any = {};

        if (type && (type === "IN" || type === "OUT")) {
            where.type = type;
        }

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        } else if (startDate) {
            where.date = {
                gte: new Date(startDate),
            };
        } else if (endDate) {
            where.date = {
                lte: new Date(endDate),
            };
        }

        const cashFlows = await prisma.cashFlow.findMany({
            where,
            orderBy: [
                { date: "asc" },
                { createdAt: "asc" },
            ],
        });

        return NextResponse.json(cashFlows);
    } catch (error) {
        console.error("Error fetching cash flows:", error);
        return NextResponse.json(
            { error: "Failed to fetch cash flows" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Only admin can create cashflow entries
        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validatedData = cashFlowSchema.parse(body);

        const cashFlowDate = typeof validatedData.date === 'string'
            ? new Date(validatedData.date)
            : validatedData.date;

        const previousFlows = await prisma.cashFlow.findMany({
            where: {
                date: {
                    lte: cashFlowDate,
                },
            },
            orderBy: [
                { date: "desc" },
                { createdAt: "desc" },
            ],
            take: 1,
        });

        const previousBalance = previousFlows.length > 0 ? previousFlows[0].balance : 0;

        const newBalance = validatedData.type === "IN"
            ? previousBalance + validatedData.amount
            : previousBalance - validatedData.amount;

        const cashFlow = await prisma.cashFlow.create({
            data: {
                type: validatedData.type,
                amount: validatedData.amount,
                description: validatedData.description,
                date: cashFlowDate,
                balance: newBalance,
            },
        });

        await prisma.cashFlow.updateMany({
            where: {
                date: {
                    gt: cashFlowDate,
                },
            },
            data: {
                balance: {
                    increment: validatedData.type === "IN" ? validatedData.amount : -validatedData.amount,
                },
            },
        });

        return NextResponse.json(cashFlow, { status: 201 });
    } catch (error: any) {
        console.error("Error creating cash flow:", error);

        if (error.name === "ZodError") {
            return NextResponse.json(
                { error: "Invalid data", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create cash flow" },
            { status: 500 }
        );
    }
}
