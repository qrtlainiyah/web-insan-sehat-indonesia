import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get("period") || "month"; // month or year
        const dateParam = searchParams.get("date");
        const referenceDate = dateParam ? new Date(dateParam) : new Date();

        let startDate: Date;
        let endDate: Date;

        if (period === "year") {
            startDate = startOfYear(referenceDate);
            endDate = endOfYear(referenceDate);
        } else {
            // Default to month
            startDate = startOfMonth(referenceDate);
            endDate = endOfMonth(referenceDate);
        }

        // Fetch all ledger entries for the period
        const ledgerEntries = await prisma.ledger.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                moringa60: true,
                moringa30: true,
                annora: true,
                alami: true,
                uramaxLaku: true,
                vitamin: true,
                bonusMoringa: true,
                bonusUramax: true,
                bonusAnnora: true,
                bonusAlami: true,
            }
        });

        // Aggregate product quantities
        const productTotals = {
            "Kelor (Moringa)": 0,
            "Uramax": 0,
            "Annora": 0,
            "Alami": 0,
            "Vitamin": 0
        };

        ledgerEntries.forEach(entry => {
            productTotals["Kelor (Moringa)"] +=
                (entry.moringa60 || 0) +
                (entry.moringa30 || 0) +
                (entry.bonusMoringa || 0);

            productTotals["Uramax"] +=
                (entry.uramaxLaku || 0) +
                (entry.bonusUramax || 0);

            productTotals["Annora"] +=
                (entry.annora || 0) +
                (entry.bonusAnnora || 0);

            productTotals["Alami"] +=
                (entry.alami || 0) +
                (entry.bonusAlami || 0);

            productTotals["Vitamin"] += (entry.vitamin || 0);
        });

        // Convert to array and sort by quantity
        const products = Object.entries(productTotals)
            .map(([name, quantity]) => ({
                name,
                quantity,
                percentage: 0 // Will calculate after we know total
            }))
            .sort((a, b) => b.quantity - a.quantity);

        // Calculate total and percentages
        const total = products.reduce((sum, p) => sum + p.quantity, 0);
        products.forEach(product => {
            product.percentage = total > 0 ? Math.round((product.quantity / total) * 100) : 0;
        });

        return NextResponse.json({
            period,
            total,
            products
        });
    } catch (error) {
        console.error("Error fetching top products:", error);
        return NextResponse.json(
            { error: "Failed to fetch top products" },
            { status: 500 }
        );
    }
}
