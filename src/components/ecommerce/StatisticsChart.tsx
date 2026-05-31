"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ChartData {
  revenue: number[];
  commission: number[];
}

const StatisticsChart = () => {
  const [chartData, setChartData] = useState<ChartData>({
    revenue: Array(12).fill(0),
    commission: Array(12).fill(0),
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const currentYear = new Date().getFullYear();

      const [ledgerData, commissionData] = await Promise.all([
        fetch(`/api/ledger/monthly?year=${currentYear}`).then(r => r.ok ? r.json() : { months: [] }),
        fetch(`/api/commission/summary?year=${currentYear}`).then(r => r.ok ? r.json() : { months: [] }),
      ]);

      const revenueByMonth = Array(12).fill(0);
      const commissionByMonth = Array(12).fill(0);

      if (ledgerData && ledgerData.months) {
        ledgerData.months.forEach((item: any) => {
          revenueByMonth[item.month - 1] = item.totalAmount;
        });
      }

      if (commissionData && commissionData.months) {
        commissionData.months.forEach((item: any) => {
          commissionByMonth[item.month - 1] = item.totalAmount || 0;
        });
      }

      setChartData({
        revenue: revenueByMonth,
        commission: commissionByMonth,
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const options: any = {
    colors: ["#3C50E0", "#80CAEE"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "bar",
      height: 335,
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    responsive: [
      {
        breakpoint: 1536,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 0,
              columnWidth: "25%",
            },
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 0,
        columnWidth: "25%",
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "last",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Satoshi",
      fontWeight: 500,
      fontSize: "14px",
      markers: {
        radius: 99,
      },
    },
    fill: {
      opacity: 1,
    },
  };

  const series = [
    {
      name: "Pendapatan",
      data: chartData.revenue,
    },
    {
      name: "Komisi",
      data: chartData.commission,
    },
  ];

  return (
    <div className="col-span-12 rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-7.5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-7.5 xl:col-span-8">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-black dark:text-white">
            Statistik Tahunan
          </h5>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {new Date().getFullYear()}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-80 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      ) : (
        <div>
          <div id="chartTwo" className="-ml-5 -mb-9">
            <ReactApexChart
              options={options}
              series={series}
              type="bar"
              height={350}
              width="100%"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsChart;
