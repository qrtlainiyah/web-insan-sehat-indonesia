import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ledgerSchema } from "@/lib/validations";
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
        const schedulerId = searchParams.get("schedulerId");
        const presenterId = searchParams.get("presenterId");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const skip = (page - 1) * limit;

        const where: any = {};

        if (schedulerId) {
            where.schedulerId = parseInt(schedulerId);
        }

        if (presenterId) {
            where.presenterId = parseInt(presenterId);
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
        } else if (month && year) {
            where.month = parseInt(month);
            where.year = parseInt(year);
        } else {
            const now = new Date();
            where.month = now.getMonth() + 1;
            where.year = now.getFullYear();
        }

        const [ledgers, total, aggregation] = await prisma.$transaction([
            prisma.ledger.findMany({
                where,
                include: {
                    scheduler: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    presenter: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: [
                    { date: "desc" },
                ],
                skip,
                take: limit,
            }),
            prisma.ledger.count({ where }),
            prisma.ledger.aggregate({
                where,
                _sum: {
                    penghasilan: true,
                    revenue: true,
                    totalBop: true,
                },
            }),
        ]);

        return NextResponse.json({
            data: ledgers,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                totalPenghasilan: aggregation._sum.penghasilan || 0,
                totalRevenue: aggregation._sum.revenue || 0,
                totalBop: aggregation._sum.totalBop || 0,
            }
        });
    } catch (error) {
        console.error("Error fetching ledgers:", error);
        return NextResponse.json(
            { error: "Failed to fetch ledgers" },
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

        // Only admin can create ledger entries
        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validatedData = ledgerSchema.parse(body);

        // Verify scheduler and presenter exist if provided
        if (validatedData.schedulerId) {
            const scheduler = await prisma.user.findUnique({
                where: { id: validatedData.schedulerId },
            });
            if (!scheduler) {
                return NextResponse.json(
                    { error: "Scheduler not found" },
                    { status: 404 }
                );
            }
        }

        if (validatedData.presenterId) {
            const presenter = await prisma.user.findUnique({
                where: { id: validatedData.presenterId },
            });
            if (!presenter) {
                return NextResponse.json(
                    { error: "Presenter not found" },
                    { status: 404 }
                );
            }
        }

        const ledgerDate = typeof validatedData.date === 'string'
            ? new Date(validatedData.date)
            : validatedData.date;

        const month = ledgerDate.getMonth() + 1;
        const year = ledgerDate.getFullYear();

        // Calculate all derived fields using helper
        const { calculateLedgerFields } = await import("@/lib/ledger-calculations");
        const calculated = calculateLedgerFields({
            session: validatedData.session,
            audiens: validatedData.audiens,
            bop: validatedData.bop,
            skl: validatedData.skl,
            moringa60: validatedData.moringa60,
            moringa30: validatedData.moringa30,
            annora: validatedData.annora,
            alami: validatedData.alami,
            uramaxLaku: validatedData.uramaxLaku || 0,
            vitamin: validatedData.vitamin || 0,
            roMoringa: validatedData.roMoringa || 0,
            roUramax: validatedData.roUramax || 0,
            roAnnora: validatedData.roAnnora || 0,
            bonusUramax: validatedData.bonusUramax || 0,
            bonusMoringa: validatedData.bonusMoringa || 0,
            bonusAnnora: validatedData.bonusAnnora || 0,
            bonusAlami: validatedData.bonusAlami || 0,
            returMoringaTerpakai: validatedData.returMoringaTerpakai || 0,
            returMoringaUtuh: validatedData.returMoringaUtuh || 0,
            returUramaxTerpakai: validatedData.returUramaxTerpakai || 0,
            returUramaxUtuh: validatedData.returUramaxUtuh || 0,
            returAnnoraTerpakai: validatedData.returAnnoraTerpakai || 0,
            returAnnoraUtuh: validatedData.returAnnoraUtuh || 0,
            bonus: validatedData.bonus,
            dp: validatedData.dp,
        });

        const ledger = await prisma.ledger.create({
            data: {
                // User relations
                schedulerId: validatedData.schedulerId || null,
                presenterId: validatedData.presenterId || null,

                // Basic info
                date: ledgerDate,
                session: validatedData.session,
                audiens: validatedData.audiens,
                month,
                year,

                // Expenses
                bop: validatedData.bop,
                skl: validatedData.skl,

                // Products sold
                moringa60: validatedData.moringa60,
                moringa30: validatedData.moringa30,
                annora: validatedData.annora,
                alami: validatedData.alami,
                uramaxLaku: validatedData.uramaxLaku || 0,

                // Vitamin
                vitamin: validatedData.vitamin || 0,

                // Repeat Order (RO)
                roMoringa: validatedData.roMoringa || 0,
                roUramax: validatedData.roUramax || 0,
                roAnnora: validatedData.roAnnora || 0,

                // Bonus Produk
                bonusUramax: validatedData.bonusUramax || 0,
                bonusMoringa: validatedData.bonusMoringa || 0,
                bonusAnnora: validatedData.bonusAnnora || 0,
                bonusAlami: validatedData.bonusAlami || 0,

                // Retur Produk
                returMoringaTerpakai: validatedData.returMoringaTerpakai || 0,
                returMoringaUtuh: validatedData.returMoringaUtuh || 0,
                returUramaxTerpakai: validatedData.returUramaxTerpakai || 0,
                returUramaxUtuh: validatedData.returUramaxUtuh || 0,
                returAnnoraTerpakai: validatedData.returAnnoraTerpakai || 0,
                returAnnoraUtuh: validatedData.returAnnoraUtuh || 0,

                //Other income
                bonus: validatedData.bonus,
                dp: validatedData.dp,

                // Calculated fields
                totalBop: calculated.totalBop,
                revenue: calculated.revenue,
                penghasilan: calculated.penghasilan,
                komisiPenjadwal: calculated.komisiPenjadwal,
                komisiPresenter: calculated.komisiPresenter,
                performa: calculated.performa,
            },
            include: {
                scheduler: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                presenter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Update stock based on products sold in ledger (best effort, no validation)
        try {
            const { updateStockFromLedger } = await import("@/lib/stock-helpers");
            await updateStockFromLedger({
                moringa60: validatedData.moringa60,
                moringa30: validatedData.moringa30,
                annora: validatedData.annora,
                alami: validatedData.alami,
                uramaxLaku: validatedData.uramaxLaku || 0,
                vitamin: validatedData.vitamin || 0,
                bonusUramax: validatedData.bonusUramax || 0,
                bonusMoringa: validatedData.bonusMoringa || 0,
                bonusAnnora: validatedData.bonusAnnora || 0,
                bonusAlami: validatedData.bonusAlami || 0,
            });
        } catch (stockError: any) {
            // Log stock update error but don't block ledger entry
            console.warn("Stock update warning:", stockError.message);
        }

        return NextResponse.json(ledger, { status: 201 });
    } catch (error: any) {
        console.error("Error creating ledger:", error);

        if (error.name === "ZodError") {
            return NextResponse.json(
                { error: "Invalid data", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create ledger" },
            { status: 500 }
        );
    }
}
