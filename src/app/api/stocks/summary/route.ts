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
        const date = searchParams.get("date") || new Date().toISOString().split('T')[0];
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        const [products, totalProducts] = await Promise.all([
            prisma.product.findMany({
                orderBy: { name: "asc" },
                skip,
                take: limit,
            }),
            prisma.product.count(),
        ]);

        const productIds = products.map((p: { id: number }) => p.id);
        const stocks = await prisma.stock.findMany({
            where: {
                date: new Date(date),
                productId: {
                    in: productIds
                }
            },
        });

        const stockMap = new Map(stocks.map((s: { productId: number; quantity: number }) => [s.productId, s.quantity]));
        const summary = products.map((product: { id: number; name: string; imageUrl: string | null }) => ({
            id: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            currentStock: stockMap.get(product.id) || 0,
            hasStockToday: stockMap.has(product.id),
        }));

        return NextResponse.json({
            date,
            summary,
            meta: {
                total: totalProducts,
                page,
                limit,
                totalPages: Math.ceil(totalProducts / limit),
            }
        });
    } catch (error) {
        console.error("Error fetching stock summary:", error);
        return NextResponse.json(
            { error: "Failed to fetch stock summary" },
            { status: 500 }
        );
    }
}
