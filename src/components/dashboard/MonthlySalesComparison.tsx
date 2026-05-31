"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface ChartDataPoint {
    date: string;
    value: number;
    count: number;
}

export default function MonthlySalesComparison() {
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchData();
    }, [selectedYear]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/dashboard/sales?period=month&year=${selectedYear}`);
            const data = await response.json();
            setChartData(data.chart || []);
        } catch (error) {
            console.error("Error fetching chart data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrevYear = () => {
        setSelectedYear(selectedYear - 1);
    };

    const handleNextYear = () => {
        setSelectedYear(selectedYear + 1);
    };

    const data = {
        labels: chartData.map(d => d.date),
        datasets: [
            {
                label: "Produk Terjual",
                data: chartData.map(d => d.value),
                backgroundColor: "rgba(34, 197, 94, 0.8)",
                borderColor: "rgb(34, 197, 94)",
                borderWidth: 1,
                borderRadius: 6,
                barThickness: 40
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
                        const dataPoint = chartData[context.dataIndex];
                        return [
                            `Produk: ${value.toLocaleString('id-ID')} produk`,
                            `Entri: ${dataPoint.count}`
                        ];
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                min: 0,
                suggestedMax: 1000,
                ticks: {
                    stepSize: 100,
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
                    <div className="h-80 bg-gray-200 rounded dark:bg-gray-700"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Produk Bulanan Terjual
                </h3>
                <div className="mt-3 flex items-center justify-between">
                    <button
                        onClick={handlePrevYear}
                        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tahun {selectedYear}
                    </p>
                    <button
                        onClick={handleNextYear}
                        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div className="h-80">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
}
