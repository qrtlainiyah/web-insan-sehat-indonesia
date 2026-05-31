import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cashFlowSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const cashFlow = await prisma.cashFlow.findUnique({
            where: { id: parseInt(id) },
        });

        if (!cashFlow) {
            return NextResponse.json(
                { error: "Cash flow not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(cashFlow);
    } catch (error) {
        console.error("Error fetching cash flow:", error);
        return NextResponse.json(
            { error: "Failed to fetch cash flow" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const validatedData = cashFlowSchema.partial().parse(body);

        const oldCashFlow = await prisma.cashFlow.findUnique({
            where: { id: parseInt(id) },
        });

        if (!oldCashFlow) {
            return NextResponse.json(
                { error: "Cash flow not found" },
                { status: 404 }
            );
        }

        const cashFlowDate = validatedData.date
            ? (typeof validatedData.date === 'string' ? new Date(validatedData.date) : validatedData.date)
            : oldCashFlow.date;

        const updateData: any = {};
        if (validatedData.type !== undefined) updateData.type = validatedData.type;
        if (validatedData.amount !== undefined) updateData.amount = validatedData.amount;
        if (validatedData.description !== undefined) updateData.description = validatedData.description;
        if (validatedData.date !== undefined) updateData.date = cashFlowDate;

        const cashFlow = await prisma.cashFlow.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        return NextResponse.json(cashFlow);
    } catch (error: any) {
        console.error("Error updating cash flow:", error);

        if (error.name === "ZodError") {
            return NextResponse.json(
                { error: "Invalid data", details: error.errors },
                { status: 400 }
            );
        }

        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Cash flow not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update cash flow" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const cashFlow = await prisma.cashFlow.findUnique({
            where: { id: parseInt(id) },
        });

        if (!cashFlow) {
            return NextResponse.json(
                { error: "Cash flow not found" },
                { status: 404 }
            );
        }

        await prisma.cashFlow.delete({
            where: { id: parseInt(id) },
        });

        await prisma.cashFlow.updateMany({
            where: {
                date: {
                    gt: cashFlow.date,
                },
            },
            data: {
                balance: {
                    increment: cashFlow.type === "IN" ? -cashFlow.amount : cashFlow.amount,
                },
            },
        });

        return NextResponse.json({ message: "Cash flow deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting cash flow:", error);

        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Cash flow not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Failed to delete cash flow" },
            { status: 500 }
        );
    }
}
