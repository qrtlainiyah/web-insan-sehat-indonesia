import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stockSchema } from "@/lib/validations";
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
        const productId = searchParams.get("productId");
        const date = searchParams.get("date");

        const where: any = {};

        if (productId) {
            where.productId = parseInt(productId);
        }

        if (date) {
            where.date = new Date(date);
        }

        const stocks = await prisma.stock.findMany({
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
                { product: { name: "asc" } },
            ],
        });

        return NextResponse.json(stocks);
    } catch (error) {
        console.error("Error fetching stocks:", error);
        return NextResponse.json(
            { error: "Failed to fetch stocks" },
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

        // Only admin can create/update stocks
        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validatedData = stockSchema.parse(body);

        const product = await prisma.product.findUnique({
            where: { id: validatedData.productId },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        const stockDate = typeof validatedData.date === 'string'
            ? new Date(validatedData.date)
            : validatedData.date;

        const stock = await prisma.stock.upsert({
            where: {
                productId_date: {
                    productId: validatedData.productId,
                    date: stockDate,
                },
            },
            update: {
                quantity: validatedData.quantity,
            },
            create: {
                productId: validatedData.productId,
                date: stockDate,
                quantity: validatedData.quantity,
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
        });

        return NextResponse.json(stock, { status: stock ? 200 : 201 });
    } catch (error: any) {
        console.error("Error creating/updating stock:", error);

        if (error.name === "ZodError") {
            return NextResponse.json(
                { error: "Invalid data", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create/update stock" },
            { status: 500 }
        );
    }
}
