import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ledgerSchema } from "@/lib/validations";
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
        const ledger = await prisma.ledger.findUnique({
            where: { id: parseInt(id) },
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

        if (!ledger) {
            return NextResponse.json(
                { error: "Ledger not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(ledger);
    } catch (error) {
        console.error("Error fetching ledger:", error);
        return NextResponse.json(
            { error: "Failed to fetch ledger" },
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

        // Only admin can update ledger entries
        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const validatedData = ledgerSchema.partial().parse(body);

        const oldLedger = await prisma.ledger.findUnique({
            where: { id: parseInt(id) },
        });

        if (!oldLedger) {
            return NextResponse.json(
                { error: "Ledger not found" },
                { status: 404 }
            );
        }

        // Prepare date fields if date is updated
        let dateFields = {};
        if (validatedData.date !== undefined) {
            const ledgerDate = typeof validatedData.date === 'string'
                ? new Date(validatedData.date)
                : validatedData.date;

            dateFields = {
                date: ledgerDate,
                month: ledgerDate.getMonth() + 1,
                year: ledgerDate.getFullYear(),
            };
        }

        // Calculate fields using updated values or existing values
        const { calculateLedgerFields } = await import("@/lib/ledger-calculations");
        const calculated = calculateLedgerFields({
            session: validatedData.session ?? oldLedger.session,
            audiens: validatedData.audiens ?? oldLedger.audiens,
            bop: validatedData.bop ?? oldLedger.bop,
            moringa60: validatedData.moringa60 ?? oldLedger.moringa60,
            moringa30: validatedData.moringa30 ?? oldLedger.moringa30,
            annora: validatedData.annora ?? oldLedger.annora,
            alami: validatedData.alami ?? oldLedger.alami,
            uramaxLaku: validatedData.uramaxLaku ?? oldLedger.uramaxLaku,
            vitamin: validatedData.vitamin ?? oldLedger.vitamin,
            roMoringa: validatedData.roMoringa ?? oldLedger.roMoringa,
            roUramax: validatedData.roUramax ?? oldLedger.roUramax,
            roAnnora: validatedData.roAnnora ?? oldLedger.roAnnora,
            bonusUramax: validatedData.bonusUramax ?? oldLedger.bonusUramax,
            bonusMoringa: validatedData.bonusMoringa ?? oldLedger.bonusMoringa,
            bonusAnnora: validatedData.bonusAnnora ?? oldLedger.bonusAnnora,
            bonusAlami: validatedData.bonusAlami ?? oldLedger.bonusAlami,
            returMoringaTerpakai: validatedData.returMoringaTerpakai ?? oldLedger.returMoringaTerpakai,
            returMoringaUtuh: validatedData.returMoringaUtuh ?? oldLedger.returMoringaUtuh,
            returUramaxTerpakai: validatedData.returUramaxTerpakai ?? oldLedger.returUramaxTerpakai,
            returUramaxUtuh: validatedData.returUramaxUtuh ?? oldLedger.returUramaxUtuh,
            returAnnoraTerpakai: validatedData.returAnnoraTerpakai ?? oldLedger.returAnnoraTerpakai,
            returAnnoraUtuh: validatedData.returAnnoraUtuh ?? oldLedger.returAnnoraUtuh,
            bonus: validatedData.bonus ?? oldLedger.bonus,
            dp: validatedData.dp ?? oldLedger.dp,
        });

        const ledger = await prisma.ledger.update({
            where: { id: parseInt(id) },
            data: {
                // User relations (allow clearing)
                schedulerId: validatedData.schedulerId !== undefined ? validatedData.schedulerId || null : undefined,
                presenterId: validatedData.presenterId !== undefined ? validatedData.presenterId || null : undefined,

                // Date fields
                ...dateFields,

                // Basic info
                session: validatedData.session,
                audiens: validatedData.audiens,

                // Expenses
                bop: validatedData.bop,
                skl: validatedData.skl,

                // Products
                moringa60: validatedData.moringa60,
                moringa30: validatedData.moringa30,
                annora: validatedData.annora,
                alami: validatedData.alami,
                uramaxLaku: validatedData.uramaxLaku,

                // Vitamin
                vitamin: validatedData.vitamin,

                // Repeat Order (RO)
                roMoringa: validatedData.roMoringa,
                roUramax: validatedData.roUramax,
                roAnnora: validatedData.roAnnora,

                // Bonus Produk
                bonusUramax: validatedData.bonusUramax,
                bonusMoringa: validatedData.bonusMoringa,
                bonusAnnora: validatedData.bonusAnnora,
                bonusAlami: validatedData.bonusAlami,

                // Retur Produk
                returMoringaTerpakai: validatedData.returMoringaTerpakai,
                returMoringaUtuh: validatedData.returMoringaUtuh,
                returUramaxTerpakai: validatedData.returUramaxTerpakai,
                returUramaxUtuh: validatedData.returUramaxUtuh,
                returAnnoraTerpakai: validatedData.returAnnoraTerpakai,
                returAnnoraUtuh: validatedData.returAnnoraUtuh,

                // Other income
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

        return NextResponse.json(ledger);
    } catch (error: any) {
        console.error("Error updating ledger:", error);

        if (error.name === "ZodError") {
            return NextResponse.json(
                { error: "Invalid data", details: error.errors },
                { status: 400 }
            );
        }

        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Ledger not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update ledger" },
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

        // Only admin can delete ledger entries
        if (session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const { id } = await params;
        await prisma.ledger.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ message: "Ledger deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting ledger:", error);

        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Ledger not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Failed to delete ledger" },
            { status: 500 }
        );
    }
}
