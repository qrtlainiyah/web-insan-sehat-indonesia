"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
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

export default function YearlySalesOverview() {
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/dashboard/sales?period=year");
            const data = await response.json();
            setChartData(data.chart || []);
        } catch (error) {
            console.error("Error fetching chart data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const data = {
        labels: chartData.map(d => d.date),
        datasets: [
            {
                label: "Produk Terjual",
                data: chartData.map(d => d.value),
                backgroundColor: "rgba(168, 85, 247, 0.8)",
                borderColor: "rgb(168, 85, 247)",
                borderWidth: 1,
                borderRadius: 8,
                barThickness: 60
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
                suggestedMax: 10000,
                ticks: {
                    stepSize: 1000,
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
                    Produk Tahunan Terjual
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    5 tahun terakhir
                </p>
            </div>
            <div className="h-80">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
}
