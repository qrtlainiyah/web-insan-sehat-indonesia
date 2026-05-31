import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stockSchema } from "@/lib/validations";
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
        const stock = await prisma.stock.findUnique({
            where: { id: parseInt(id) },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        imageUrl: true,
                    },
                },
            },
        });

        if (!stock) {
            return NextResponse.json(
                { error: "Stock not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(stock);
    } catch (error) {
        console.error("Error fetching stock:", error);
        return NextResponse.json(
            { error: "Failed to fetch stock" },
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
        const validatedData = stockSchema.partial().parse(body);

        if (validatedData.date) {
            const stockDate = typeof validatedData.date === 'string'
                ? new Date(validatedData.date)
                : validatedData.date;
            validatedData.date = stockDate as any;
        }

        const stock = await prisma.stock.update({
            where: { id: parseInt(id) },
            data: validatedData as any,
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        imageUrl: true,
                    },
                },
            },
        });

        return NextResponse.json(stock);
    } catch (error: any) {
        console.error("Error updating stock:", error);

        if (error.name === "ZodError") {
            return NextResponse.json(
                { error: "Invalid data", details: error.errors },
                { status: 400 }
            );
        }

        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Stock not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update stock" },
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
        await prisma.stock.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ message: "Stock deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting stock:", error);

        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Stock not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Failed to delete stock" },
            { status: 500 }
        );
    }
}
