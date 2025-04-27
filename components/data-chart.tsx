"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

interface DataPoint {
  tahun: number
  harga: number
}

interface DataChartProps {
  data: DataPoint[]
}

export default function DataChart({ data }: DataChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Pastikan data diurutkan berdasarkan tahun
    const sortedData = [...data].sort((a, b) => a.tahun - b.tahun)

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: sortedData.map((d) => d.tahun.toString()),
        datasets: [
          {
            label: "Harga Beras (Ribu Rupiah)",
            data: sortedData.map((d) => d.harga),
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: "rgb(59, 130, 246)",
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: "Harga (Ribu Rupiah)",
            },
          },
          x: {
            title: {
              display: true,
              text: "Tahun",
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) =>
                `Harga: Rp ${context.parsed.y.toLocaleString("id-ID", {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}`,
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return <canvas ref={chartRef} />
}
