"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, DollarSign, TrendingUp, Percent } from "lucide-react";

interface Stats {
  totalProducts: number;
  currentBalance: number;
  monthlyEarnings: number;
  monthlyCommissions: number;
}

export const EcommerceMetrics = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    currentBalance: 0,
    monthlyEarnings: 0,
    monthlyCommissions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const [products, cashFlows, ledgers, commissions] = await Promise.all([
        fetch("/api/products").then(r => r.ok ? r.json() : []),
        fetch("/api/cashflow").then(r => r.ok ? r.json() : []),
        fetch(`/api/ledger/summary?month=${currentMonth}&year=${currentYear}`).then(r => r.ok ? r.json() : { summary: [] }),
        fetch(`/api/commission/summary?month=${currentMonth}&year=${currentYear}`).then(r => r.ok ? r.json() : { totalCommission: 0 }),
      ]);

      const currentBalance = cashFlows.length > 0 ? cashFlows[cashFlows.length - 1].balance : 0;
      const monthlyEarnings = ledgers.summary.reduce((sum: number, user: any) => sum + user.totalEarnings, 0);

      setStats({
        totalProducts: products.meta?.total || products.data?.length || products.length || 0,
        currentBalance,
        monthlyEarnings,
        monthlyCommissions: commissions.totalCommission || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
            <div className="mt-5 h-6 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="mt-2 h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      <Link href="/products" className="rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-lg transition-all dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/20">
          <Package className="text-blue-600 size-6 dark:text-blue-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Produk
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {stats.totalProducts}
            </h4>
          </div>
        </div>
      </Link>

      <Link href="/cashflow" className="rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-lg transition-all dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/20">
          <DollarSign className="text-green-600 size-6 dark:text-green-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Saldo Kas
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatCurrency(stats.currentBalance)}
            </h4>
          </div>
        </div>
      </Link>

      <Link href="/ledger" className="rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-lg transition-all dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-900/20">
          <TrendingUp className="text-purple-600 size-6 dark:text-purple-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Pendapatan Bulanan
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatCurrency(stats.monthlyEarnings)}
            </h4>
          </div>
        </div>
      </Link>

      <Link href="/commission" className="rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-lg transition-all dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl dark:bg-orange-900/20">
          <Percent className="text-orange-600 size-6 dark:text-orange-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Komisi
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatCurrency(stats.monthlyCommissions)}
            </h4>
          </div>
        </div>
      </Link>
    </div>
  );
};
