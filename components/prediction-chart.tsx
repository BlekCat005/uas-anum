"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

interface DataPoint {
  tahun: number
  harga: number
}

interface PredictionChartProps {
  dataHistoris: DataPoint[]
  prediksiNewton: DataPoint[]
  prediksiRegresi: DataPoint[]
}

export default function PredictionChart({ dataHistoris, prediksiNewton, prediksiRegresi }: PredictionChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || dataHistoris.length === 0) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Pastikan data diurutkan berdasarkan tahun
    const sortedData = [...dataHistoris].sort((a, b) => a.tahun - b.tahun)

    // Combine historical data with predictions
    const allYears = [...sortedData.map((d) => d.tahun), ...prediksiNewton.map((d) => d.tahun)].sort((a, b) => a - b)

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: allYears.map((year) => year.toString()),
        datasets: [
          {
            label: "Data Historis",
            data: allYears.map((year) => {
              const point = sortedData.find((d) => d.tahun === year)
              return point ? point.harga : null
            }),
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: "rgb(59, 130, 246)",
            pointRadius: 4,
          },
          {
            label: "Prediksi (Interpolasi Newton - data 4 tahun terakhir)",
            data: allYears.map((year) => {
              const point = prediksiNewton.find((d) => d.tahun === year)
              return point ? point.harga : null
            }),
            borderColor: "rgb(220, 38, 38)",
            backgroundColor: "rgba(220, 38, 38, 0.1)",
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.3,
            fill: false,
            pointBackgroundColor: "rgb(220, 38, 38)",
            pointRadius: 4,
          },
          {
            label: "Prediksi (Regresi Linier - semua data)",
            data: allYears.map((year) => {
              const point = prediksiRegresi.find((d) => d.tahun === year)
              return point ? point.harga : null
            }),
            borderColor: "rgb(16, 185, 129)",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            borderWidth: 2,
            borderDash: [2, 2],
            tension: 0.3,
            fill: false,
            pointBackgroundColor: "rgb(16, 185, 129)",
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
                `${context.dataset.label}: Rp ${context.parsed.y.toLocaleString("id-ID", {
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
  }, [dataHistoris, prediksiNewton, prediksiRegresi])

  return <canvas ref={chartRef} />
}
