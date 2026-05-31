"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface ChartDataPoint {
    date: string;
    value: number;
    count: number;
}

export default function DailySalesTrend() {
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/dashboard/sales?period=day&month=${selectedMonth}&year=${selectedYear}`);
            const data = await response.json();
            setChartData(data.chart || []);
        } catch (error) {
            console.error("Error fetching chart data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrevMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    const getMonthName = (month: number) => {
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return months[month - 1];
    };

    const data = {
        labels: chartData.map(d => d.date),
        datasets: [
            {
                label: "Produk Terjual",
                data: chartData.map(d => d.value),
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: "rgb(59, 130, 246)",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointHoverRadius: 6
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const value = context.parsed.y;
                        return `${value.toLocaleString('id-ID')} produk`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                min: 0,
                suggestedMax: 100,
                ticks: {
                    stepSize: 10,
                    callback: function (value: any) {
                        return `${value.toLocaleString('id-ID')}`;
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="animate-pulse">
                    <div className="h-6 w-48 bg-gray-200 rounded dark:bg-gray-700 mb-6"></div>
                    <div className="h-64 bg-gray-200 rounded dark:bg-gray-700"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Produk Harian Terjual
                </h3>
                <div className="mt-3 flex items-center justify-between">
                    <button
                        onClick={handlePrevMonth}
                        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {getMonthName(selectedMonth)} {selectedYear}
                    </p>
                    <button
                        onClick={handleNextMonth}
                        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div className="h-64">
                <Line data={data} options={options} />
            </div>
        </div>
    );
}
