import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/validations";
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
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;
        const productId = searchParams.get("productId");
        const type = searchParams.get("type");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const where: any = {};

        if (productId) {
            where.productId = parseInt(productId);
        }

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

        const [transactions, total] = await prisma.$transaction([
            prisma.stockTransaction.findMany({
                where,
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            imageUrl: true,
                        },
                    },
                },
                orderBy: [
                    { date: "desc" },
                    { createdAt: "desc" },
                ],
                skip,
                take: limit,
            }),
            prisma.stockTransaction.count({ where }),
        ]);

        return NextResponse.json({
            data: transactions,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        });

    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json(
            { error: "Failed to fetch transactions" },
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

        // Only admin can create transactions
        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validatedData = transactionSchema.parse(body);

        const product = await prisma.product.findUnique({
            where: { id: validatedData.productId },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Validate stock for OUT transactions
        if (validatedData.type === 'OUT' && product.stockAvailable < validatedData.quantity) {
            return NextResponse.json(
                { error: `Stok tidak mencukupi. Stok tersedia: ${product.stockAvailable}` },
                { status: 400 }
            );
        }

        const transactionDate = typeof validatedData.date === 'string'
            ? new Date(validatedData.date)
            : validatedData.date;

        // Create transaction and update stock in a transaction
        const [transaction] = await prisma.$transaction([
            prisma.stockTransaction.create({
                data: {
                    productId: validatedData.productId,
                    type: validatedData.type,
                    quantity: validatedData.quantity,
                    description: validatedData.description || null,
                    date: transactionDate,
                },
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
            // Update stock based on transaction type
            prisma.product.update({
                where: { id: validatedData.productId },
                data: {
                    stockAvailable: {
                        [validatedData.type === 'IN' ? 'increment' : 'decrement']: validatedData.quantity
                    }
                }
            })
        ]);

        return NextResponse.json(transaction, { status: 201 });
    } catch (error: any) {
        console.error("Error creating transaction:", error);

        if (error.name === "ZodError") {
            return NextResponse.json(
                { error: "Invalid data", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create transaction" },
            { status: 500 }
        );
    }
}
