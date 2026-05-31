import type { Metadata } from "next";
import SalesMetricsCards from "@/components/dashboard/SalesMetricsCards";
import DailySalesTrend from "@/components/dashboard/DailySalesTrend";
import MonthlySalesComparison from "@/components/dashboard/MonthlySalesComparison";
import YearlySalesOverview from "@/components/dashboard/YearlySalesOverview";

export const metadata: Metadata = {
  title: "Dashboard - Insan Sehat Indonesia",
  description: "Sales Development Dashboard",
};

export default function Dashboard() {
  return (
    <div className="space-y-6 p-0 sm:p-6">
      {/* Page Header */}
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Penjualan
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Perkembangan penjualan harian, bulanan, dan tahunan
        </p>
      </div>

      {/* Sales Metrics Cards */}
      <div className="px-4 sm:px-0">
        <SalesMetricsCards />
      </div>



      {/* Daily Sales Trend */}
      <div className="px-4 sm:px-0">
        <DailySalesTrend />
      </div>

      {/* Monthly Sales Comparison */}
      <div className="px-4 sm:px-0">
        <MonthlySalesComparison />
      </div>

      {/* Yearly Sales Overview */}
      <div className="px-4 sm:px-0">
        <YearlySalesOverview />
      </div>
    </div>
  );
}