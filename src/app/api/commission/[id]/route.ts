import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { commissionSchema } from "@/lib/validations";
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
        const commission = await prisma.commission.findUnique({
            where: { id: parseInt(id) },
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

        if (!commission) {
            return NextResponse.json(
                { error: "Commission not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(commission);
    } catch (error) {
        console.error("Error fetching commission:", error);
        return NextResponse.json(
            { error: "Failed to fetch commission" },
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
        const validatedData = commissionSchema.partial().parse(body);

        const oldCommission = await prisma.commission.findUnique({
            where: { id: parseInt(id) },
        });

        if (!oldCommission) {
            return NextResponse.json(
                { error: "Commission not found" },
                { status: 404 }
            );
        }

        // Prepare update data
        const updateData: any = {};
        if (validatedData.userId) updateData.userId = validatedData.userId;
        if (validatedData.amount !== undefined) updateData.amount = validatedData.amount;
        if (validatedData.month) updateData.month = validatedData.month;
        if (validatedData.year) updateData.year = validatedData.year;
        if (validatedData.description !== undefined) updateData.description = validatedData.description;
        if (validatedData.role) updateData.role = validatedData.role;

        // Specialized fields
        if (validatedData.sessions !== undefined) updateData.sessions = validatedData.sessions;
        if (validatedData.audience !== undefined) updateData.audience = validatedData.audience;

        // Sales
        if (validatedData.moringaSold !== undefined) updateData.moringaSold = validatedData.moringaSold;
        if (validatedData.uramaxSold !== undefined) updateData.uramaxSold = validatedData.uramaxSold;
        if (validatedData.annoraSold !== undefined) updateData.annoraSold = validatedData.annoraSold;

        // RO
        if (validatedData.roMoringa !== undefined) updateData.roMoringa = validatedData.roMoringa;
        if (validatedData.roUramax !== undefined) updateData.roUramax = validatedData.roUramax;
        if (validatedData.roAnnora !== undefined) updateData.roAnnora = validatedData.roAnnora;

        // Kasbon
        if (validatedData.kasbonMoringa !== undefined) updateData.kasbonMoringa = validatedData.kasbonMoringa;
        if (validatedData.kasbonUramax !== undefined) updateData.kasbonUramax = validatedData.kasbonUramax;
        if (validatedData.kasbonAnnora !== undefined) updateData.kasbonAnnora = validatedData.kasbonAnnora;

        // Retur
        if (validatedData.returnMoringa !== undefined) updateData.returnMoringa = validatedData.returnMoringa;
        if (validatedData.returnUramax !== undefined) updateData.returnUramax = validatedData.returnUramax;
        if (validatedData.returnAnnora !== undefined) updateData.returnAnnora = validatedData.returnAnnora;

        // Bonuses
        if (validatedData.bonusMoringa !== undefined) updateData.bonusMoringa = validatedData.bonusMoringa;
        if (validatedData.bonusUramax !== undefined) updateData.bonusUramax = validatedData.bonusUramax;
        if (validatedData.bonusAnnora !== undefined) updateData.bonusAnnora = validatedData.bonusAnnora;
        if (validatedData.bonusVitamin !== undefined) updateData.bonusVitamin = validatedData.bonusVitamin;

        const commission = await prisma.commission.update({
            where: { id: parseInt(id) },
            data: updateData,
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

        return NextResponse.json(commission);
    } catch (error: any) {
        console.error("Error updating commission:", error);

        if (error.name === "ZodError") {
            return NextResponse.json(
                { error: "Invalid data", details: error.errors },
                { status: 400 }
            );
        }

        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Commission not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update commission" },
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
        await prisma.commission.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ message: "Commission deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting commission:", error);

        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Commission not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Failed to delete commission" },
            { status: 500 }
        );
    }
}
