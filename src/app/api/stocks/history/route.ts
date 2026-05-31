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
        const productId = searchParams.get("productId");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        const where: any = {};

        if (productId) {
            where.productId = parseInt(productId);
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

        const [stocks, total] = await prisma.$transaction([
            prisma.stock.findMany({
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
                skip,
                take: limit,
            }),
            prisma.stock.count({ where }),
        ]);

        return NextResponse.json({
            data: stocks,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        });
    } catch (error) {
        console.error("Error fetching stock history:", error);
        return NextResponse.json(
            { error: "Failed to fetch stock history" },
            { status: 500 }
        );
    }
}
