import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths, subYears, format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get("period") || "day"; // day, month, year
        const dateParam = searchParams.get("date");
        const monthParam = searchParams.get("month"); // 1-12
        const yearParam = searchParams.get("year"); // YYYY

        // Determine reference date based on parameters
        let referenceDate: Date;
        if (yearParam && monthParam) {
            referenceDate = new Date(parseInt(yearParam), parseInt(monthParam) - 1, 1);
        } else if (yearParam) {
            referenceDate = new Date(parseInt(yearParam), 0, 1);
        } else if (dateParam) {
            referenceDate = new Date(dateParam);
        } else {
            referenceDate = new Date();
        }

        let currentStart: Date;
        let currentEnd: Date;
        let previousStart: Date;
        let previousEnd: Date;
        let chartData: Array<{ date: string; value: number; count: number }> = [];

        // Calculate date ranges based on period
        if (period === "day") {
            // Daily metrics - for cards show today's data, for chart show all days in current month
            const selectedMonth = monthParam ? parseInt(monthParam) - 1 : referenceDate.getMonth();
            const selectedYear = yearParam ? parseInt(yearParam) : referenceDate.getFullYear();

            // For metric cards: use single day (today or selected date)
            const selectedDate = dateParam ? new Date(dateParam) : new Date();
            currentStart = startOfDay(selectedDate);
            currentEnd = endOfDay(selectedDate);
            previousStart = startOfDay(subDays(selectedDate, 1));
            previousEnd = endOfDay(subDays(selectedDate, 1));

            // For chart: Get all days in selected month
            const chartMonth = new Date(selectedYear, selectedMonth, 1);
            const daysInMonth = endOfMonth(chartMonth).getDate();
            const days = [];
            for (let i = 1; i <= daysInMonth; i++) {
                const day = new Date(selectedYear, selectedMonth, i);
                days.push({
                    start: startOfDay(day),
                    end: endOfDay(day),
                    label: format(day, "d", { locale: localeId }) // Just day number
                });
            }

            // Fetch data for each day (for chart)
            for (const day of days) {
                const result = await prisma.ledger.aggregate({
                    where: {
                        date: {
                            gte: day.start,
                            lte: day.end
                        }
                    },
                    _sum: {
                        moringa60: true,
                        moringa30: true,
                        annora: true,
                        alami: true,
                        uramaxLaku: true
                    },
                    _count: true
                });

                const totalProducts = (result._sum.moringa60 || 0) +
                    (result._sum.moringa30 || 0) +
                    (result._sum.annora || 0) +
                    (result._sum.alami || 0) +
                    (result._sum.uramaxLaku || 0);

                chartData.push({
                    date: day.label,
                    value: totalProducts,
                    count: result._count
                });
            }
        } else if (period === "month") {
            // Monthly metrics - for cards show current month, for chart show 12 months of current year
            const selectedMonth = monthParam ? parseInt(monthParam) - 1 : referenceDate.getMonth();
            const selectedYear = yearParam ? parseInt(yearParam) : referenceDate.getFullYear();

            // For metric cards: use single month (current month or selected month)
            const selectedMonthDate = new Date(selectedYear, selectedMonth, 1);
            currentStart = startOfMonth(selectedMonthDate);
            currentEnd = endOfMonth(selectedMonthDate);
            previousStart = startOfMonth(subMonths(selectedMonthDate, 1));
            previousEnd = endOfMonth(subMonths(selectedMonthDate, 1));

            // For chart: Get all 12 months in current year
            const chartYear = selectedYear;
            const months = [];
            for (let i = 0; i < 12; i++) {
                const month = new Date(chartYear, i, 1);
                months.push({
                    start: startOfMonth(month),
                    end: endOfMonth(month),
                    label: format(month, "MMM", { locale: localeId }) // Just month name
                });
            }

            // Fetch data for each month (for chart)
            for (const month of months) {
                const result = await prisma.ledger.aggregate({
                    where: {
                        date: {
                            gte: month.start,
                            lte: month.end
                        }
                    },
                    _sum: {
                        moringa60: true,
                        moringa30: true,
                        annora: true,
                        alami: true,
                        uramaxLaku: true
                    },
                    _count: true
                });

                const totalProducts = (result._sum.moringa60 || 0) +
                    (result._sum.moringa30 || 0) +
                    (result._sum.annora || 0) +
                    (result._sum.alami || 0) +
                    (result._sum.uramaxLaku || 0);

                chartData.push({
                    date: month.label,
                    value: totalProducts,
                    count: result._count
                });
            }
        } else if (period === "year") {
            // Yearly metrics
            currentStart = startOfYear(referenceDate);
            currentEnd = endOfYear(referenceDate);
            previousStart = startOfYear(subYears(referenceDate, 1));
            previousEnd = endOfYear(subYears(referenceDate, 1));

            // Get last 5 years for chart
            const years = [];
            for (let i = 4; i >= 0; i--) {
                const year = subYears(referenceDate, i);
                years.push({
                    start: startOfYear(year),
                    end: endOfYear(year),
                    label: format(year, "yyyy")
                });
            }

            // Fetch data for each year
            for (const year of years) {
                const result = await prisma.ledger.aggregate({
                    where: {
                        date: {
                            gte: year.start,
                            lte: year.end
                        }
                    },
                    _sum: {
                        moringa60: true,
                        moringa30: true,
                        annora: true,
                        alami: true,
                        uramaxLaku: true
                    },
                    _count: true
                });

                const totalProducts = (result._sum.moringa60 || 0) +
                    (result._sum.moringa30 || 0) +
                    (result._sum.annora || 0) +
                    (result._sum.alami || 0) +
                    (result._sum.uramaxLaku || 0);

                chartData.push({
                    date: year.label,
                    value: totalProducts,
                    count: result._count
                });
            }
        } else {
            return NextResponse.json(
                { error: "Invalid period. Must be 'day', 'month', or 'year'" },
                { status: 400 }
            );
        }

        // Get current period data
        const currentData = await prisma.ledger.aggregate({
            where: {
                date: {
                    gte: currentStart,
                    lte: currentEnd
                }
            },
            _sum: {
                moringa60: true,
                moringa30: true,
                annora: true,
                alami: true,
                uramaxLaku: true
            },
            _count: true
        });

        // Get previous period data
        const previousData = await prisma.ledger.aggregate({
            where: {
                date: {
                    gte: previousStart,
                    lte: previousEnd
                }
            },
            _sum: {
                moringa60: true,
                moringa30: true,
                annora: true,
                alami: true,
                uramaxLaku: true
            },
            _count: true
        });

        const currentValue = (currentData._sum.moringa60 || 0) +
            (currentData._sum.moringa30 || 0) +
            (currentData._sum.annora || 0) +
            (currentData._sum.alami || 0) +
            (currentData._sum.uramaxLaku || 0);

        const previousValue = (previousData._sum.moringa60 || 0) +
            (previousData._sum.moringa30 || 0) +
            (previousData._sum.annora || 0) +
            (previousData._sum.alami || 0) +
            (previousData._sum.uramaxLaku || 0);

        // Calculate trend percentage
        let trend = 0;
        if (previousValue > 0) {
            trend = ((currentValue - previousValue) / previousValue) * 100;
        } else if (currentValue > 0) {
            trend = 100;
        }

        return NextResponse.json({
            current: {
                value: currentValue,
                count: currentData._count,
                period: format(referenceDate, period === "day" ? "d MMMM yyyy" : period === "month" ? "MMMM yyyy" : "yyyy", { locale: localeId })
            },
            previous: {
                value: previousValue,
                count: previousData._count,
                period: format(
                    period === "day" ? subDays(referenceDate, 1) : period === "month" ? subMonths(referenceDate, 1) : subYears(referenceDate, 1),
                    period === "day" ? "d MMMM yyyy" : period === "month" ? "MMMM yyyy" : "yyyy",
                    { locale: localeId }
                )
            },
            trend: Math.round(trend * 10) / 10, // Round to 1 decimal
            chart: chartData
        });
    } catch (error) {
        console.error("Error fetching sales metrics:", error);
        return NextResponse.json(
            { error: "Failed to fetch sales metrics" },
            { status: 500 }
        );
    }
}
