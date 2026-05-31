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
        const month = searchParams.get("month");
        const year = searchParams.get("year");

        const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
        const targetYear = year ? parseInt(year) : new Date().getFullYear();

        // Fetch all ledger entries for the target month/year
        const ledgers = await prisma.ledger.findMany({
            where: {
                month: targetMonth,
                year: targetYear,
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

        // Aggregate data by scheduler
        const schedulerData: Record<number, any> = {};
        const presenterData: Record<number, any> = {};

        ledgers.forEach(ledger => {
            // Process Scheduler data
            if (ledger.schedulerId && ledger.scheduler) {
                if (!schedulerData[ledger.schedulerId]) {
                    schedulerData[ledger.schedulerId] = {
                        userId: ledger.schedulerId,
                        userName: ledger.scheduler.name,
                        userEmail: ledger.scheduler.email,
                        role: "SCHEDULER",
                        totalIncome: 0,
                        totalSessions: 0,
                        totalProductsSold: 0,
                        totalBonusProducts: 0,
                        totalVitamins: 0,
                        totalRO: 0,
                        totalReturns: 0,
                        // Detailed breakdowns
                        moringaSold: 0,
                        uramaxSold: 0,
                        annoraSold: 0,
                        alamiSold: 0,
                        roMoringa: 0,
                        roUramax: 0,
                        roAnnora: 0,
                    };
                }

                const data = schedulerData[ledger.schedulerId];
                data.totalIncome += ledger.komisiPenjadwal;
                data.totalSessions += ledger.session;
                data.totalProductsSold += (ledger.moringa60 + ledger.moringa30 + ledger.annora + ledger.alami + ledger.uramaxLaku);
                data.totalBonusProducts += (ledger.bonusMoringa + ledger.bonusUramax + ledger.bonusAnnora + ledger.bonusAlami);
                data.totalVitamins += ledger.vitamin;
                data.totalRO += (ledger.roMoringa + ledger.roUramax + ledger.roAnnora);
                data.totalReturns += (
                    ledger.returMoringaTerpakai + ledger.returMoringaUtuh +
                    ledger.returUramaxTerpakai + ledger.returUramaxUtuh +
                    ledger.returAnnoraTerpakai + ledger.returAnnoraUtuh
                );

                // Detailed breakdowns
                data.moringaSold += (ledger.moringa60 + ledger.moringa30);
                data.uramaxSold += ledger.uramaxLaku;
                data.annoraSold += ledger.annora;
                data.alamiSold += ledger.alami;
                data.roMoringa += ledger.roMoringa;
                data.roUramax += ledger.roUramax;
                data.roAnnora += ledger.roAnnora;
            }

            // Process Presenter data
            if (ledger.presenterId && ledger.presenter) {
                if (!presenterData[ledger.presenterId]) {
                    presenterData[ledger.presenterId] = {
                        userId: ledger.presenterId,
                        userName: ledger.presenter.name,
                        userEmail: ledger.presenter.email,
                        role: "PRESENTER",
                        totalIncome: 0,
                        totalSessions: 0,
                        totalProductsSold: 0,
                        totalBonusProducts: 0,
                        totalVitamins: 0,
                        totalRO: 0,
                        totalReturns: 0,
                        // Detailed breakdowns
                        moringaSold: 0,
                        uramaxSold: 0,
                        annoraSold: 0,
                        alamiSold: 0,
                        roMoringa: 0,
                        roUramax: 0,
                        roAnnora: 0,
                    };
                }

                const data = presenterData[ledger.presenterId];
                data.totalIncome += ledger.komisiPresenter;
                data.totalSessions += ledger.session;
                data.totalProductsSold += (ledger.moringa60 + ledger.moringa30 + ledger.annora + ledger.alami + ledger.uramaxLaku);
                data.totalBonusProducts += (ledger.bonusMoringa + ledger.bonusUramax + ledger.bonusAnnora + ledger.bonusAlami);
                data.totalVitamins += ledger.vitamin;
                data.totalRO += (ledger.roMoringa + ledger.roUramax + ledger.roAnnora);
                data.totalReturns += (
                    ledger.returMoringaTerpakai + ledger.returMoringaUtuh +
                    ledger.returUramaxTerpakai + ledger.returUramaxUtuh +
                    ledger.returAnnoraTerpakai + ledger.returAnnoraUtuh
                );

                // Detailed breakdowns
                data.moringaSold += (ledger.moringa60 + ledger.moringa30);
                data.uramaxSold += ledger.uramaxLaku;
                data.annoraSold += ledger.annora;
                data.alamiSold += ledger.alami;
                data.roMoringa += ledger.roMoringa;
                data.roUramax += ledger.roUramax;
                data.roAnnora += ledger.roAnnora;
            }
        });

        const schedulers = Object.values(schedulerData);
        const presenters = Object.values(presenterData);

        // Calculate totals
        const totalSchedulerIncome = schedulers.reduce((sum, s) => sum + s.totalIncome, 0);
        const totalPresenterIncome = presenters.reduce((sum, p) => sum + p.totalIncome, 0);

        return NextResponse.json({
            month: targetMonth,
            year: targetYear,
            schedulers,
            presenters,
            totals: {
                schedulerIncome: totalSchedulerIncome,
                presenterIncome: totalPresenterIncome,
                totalIncome: totalSchedulerIncome + totalPresenterIncome,
            },
            ledgerCount: ledgers.length,
        });
    } catch (error) {
        console.error("Error calculating commission:", error);
        return NextResponse.json(
            { error: "Failed to calculate commission" },
            { status: 500 }
        );
    }
}
