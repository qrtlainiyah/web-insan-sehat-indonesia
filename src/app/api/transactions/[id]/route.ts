import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/validations";
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
        const transaction = await prisma.stockTransaction.findUnique({
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

        if (!transaction) {
            return NextResponse.json(
                { error: "Transaction not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(transaction);
    } catch (error) {
        console.error("Error fetching transaction:", error);
        return NextResponse.json(
            { error: "Failed to fetch transaction" },
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
        const validatedData = transactionSchema.partial().parse(body);

        // Get old transaction to revert stock changes
        const oldTransaction = await prisma.stockTransaction.findUnique({
            where: { id: parseInt(id) },
        });

        if (!oldTransaction) {
            return NextResponse.json(
                { error: "Transaction not found" },
                { status: 404 }
            );
        }

        if (validatedData.date) {
            const transactionDate = typeof validatedData.date === 'string'
                ? new Date(validatedData.date)
                : validatedData.date;
            validatedData.date = transactionDate as any;
        }

        // Validate stock for OUT transactions
        const newType = validatedData.type || oldTransaction.type;
        const newQuantity = validatedData.quantity || oldTransaction.quantity;
        const productId = validatedData.productId || oldTransaction.productId;

        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Calculate net stock change
        // Revert old transaction effect, then apply new transaction effect
        let stockChange = 0;

        // Revert old transaction
        if (oldTransaction.type === 'IN') {
            stockChange -= oldTransaction.quantity; // Remove previous IN
        } else {
            stockChange += oldTransaction.quantity; // Add back previous OUT
        }

        // Apply new transaction
        if (newType === 'IN') {
            stockChange += newQuantity;
        } else {
            stockChange -= newQuantity;
        }

        // Check if new stock would be negative
        if (product.stockAvailable + stockChange < 0) {
            return NextResponse.json(
                { error: `Stok tidak mencukupi. Stok tersedia: ${product.stockAvailable}` },
                { status: 400 }
            );
        }

        // Update transaction and stock in a transaction
        const [transaction] = await prisma.$transaction([
            prisma.stockTransaction.update({
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
            }),
            prisma.product.update({
                where: { id: productId },
                data: {
                    stockAvailable: {
                        increment: stockChange
                    }
                }
            })
        ]);

        return NextResponse.json(transaction);
    } catch (error: any) {
        console.error("Error updating transaction:", error);

        if (error.name === "ZodError") {
            return NextResponse.json(
                { error: "Invalid data", details: error.errors },
                { status: 400 }
            );
        }

        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Transaction not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update transaction" },
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

        // Get transaction to revert stock changes
        const transaction = await prisma.stockTransaction.findUnique({
            where: { id: parseInt(id) },
        });

        if (!transaction) {
            return NextResponse.json(
                { error: "Transaction not found" },
                { status: 404 }
            );
        }

        // Delete transaction and revert stock in a transaction
        await prisma.$transaction([
            prisma.stockTransaction.delete({
                where: { id: parseInt(id) },
            }),
            // Revert stock: if it was IN, subtract; if it was OUT, add back
            prisma.product.update({
                where: { id: transaction.productId },
                data: {
                    stockAvailable: {
                        [transaction.type === 'IN' ? 'decrement' : 'increment']: transaction.quantity
                    }
                }
            })
        ]);

        return NextResponse.json({ message: "Transaction deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting transaction:", error);

        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Transaction not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Failed to delete transaction" },
            { status: 500 }
        );
    }
}
