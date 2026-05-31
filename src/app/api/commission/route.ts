import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { commissionSchema } from "@/lib/validations";
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

        const month = searchParams.get("month");
        const year = searchParams.get("year");
        const userId = searchParams.get("userId");

        const where: any = {};

        if (userId) {
            where.userId = parseInt(userId);
        }

        if (month && year) {
            where.month = parseInt(month);
            where.year = parseInt(year);
        } else {
            const now = new Date();
            where.month = now.getMonth() + 1;
            where.year = now.getFullYear();
        }

        const [commissions, total] = await prisma.$transaction([
            prisma.commission.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: [
                    { year: "desc" },
                    { month: "desc" },
                    { user: { name: "asc" } },
                ],
                skip,
                take: limit,
            }),
            prisma.commission.count({ where }),
        ]);

        return NextResponse.json({
            data: commissions,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        });
    } catch (error) {
        console.error("Error fetching commissions:", error);
        return NextResponse.json(
            { error: "Failed to fetch commissions" },
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

        // Only admin can create commissions
        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validatedData = commissionSchema.parse(body);

        const user = await prisma.user.findUnique({
            where: { id: validatedData.userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const commission = await prisma.commission.create({
            data: {
                userId: validatedData.userId,
                amount: validatedData.amount,
                month: validatedData.month,
                year: validatedData.year,
                description: validatedData.description || null,
                role: validatedData.role || "PRESENTER",

                // Detailed Metrics
                sessions: validatedData.sessions ?? 0,
                audience: validatedData.audience ?? 0,

                // Sales
                moringaSold: validatedData.moringaSold ?? 0,
                uramaxSold: validatedData.uramaxSold ?? 0,
                annoraSold: validatedData.annoraSold ?? 0,

                // RO
                roMoringa: validatedData.roMoringa ?? 0,
                roUramax: validatedData.roUramax ?? 0,
                roAnnora: validatedData.roAnnora ?? 0,

                // Kasbon
                kasbonMoringa: validatedData.kasbonMoringa ?? 0,
                kasbonUramax: validatedData.kasbonUramax ?? 0,
                kasbonAnnora: validatedData.kasbonAnnora ?? 0,

                // Retur
                returnMoringa: validatedData.returnMoringa ?? 0,
                returnUramax: validatedData.returnUramax ?? 0,
                returnAnnora: validatedData.returnAnnora ?? 0,

                // Bonuses
                bonusMoringa: validatedData.bonusMoringa ?? 0,
                bonusUramax: validatedData.bonusUramax ?? 0,
                bonusAnnora: validatedData.bonusAnnora ?? 0,
                bonusVitamin: validatedData.bonusVitamin ?? 0,
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

        return NextResponse.json(commission, { status: 201 });
    } catch (error: any) {
        console.error("Error creating commission:", error);

        if (error.name === "ZodError") {
            return NextResponse.json(
                { error: "Invalid data", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create commission" },
            { status: 500 }
        );
    }
}
