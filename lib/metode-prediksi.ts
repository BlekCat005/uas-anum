/**
 * Implementasi Metode Interpolasi Newton
 *
 * @param x Array tahun data historis
 * @param y Array harga beras rata-rata tahunan
 * @param tahun Tahun yang akan diprediksi
 * @param bulan Bulan yang akan diprediksi (1-12)
 * @returns Hasil prediksi harga beras
 */
export function interpolasiNewton(x: number[], y: number[], tahun: number, bulan: number): number {
  // Validasi input
  if (x.length < 2 || y.length < 2 || x.length !== y.length) {
    console.error("Data tidak cukup untuk interpolasi Newton")
    return 0
  }

  // Konversi tahun dan bulan ke format desimal (tahun.bulan)
  const xTarget = tahun + (bulan - 1) / 12

  // Hitung tabel selisih terbagi (divided differences)
  const n = x.length
  const divDiff: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0))

  // Isi kolom pertama dengan nilai y
  for (let i = 0; i < n; i++) {
    divDiff[i][0] = y[i]
  }

  // Hitung selisih terbagi
  for (let j = 1; j < n; j++) {
    for (let i = 0; i < n - j; i++) {
      // Pastikan tidak ada pembagian dengan nol
      if (x[i + j] - x[i] === 0) {
        divDiff[i][j] = 0
      } else {
        divDiff[i][j] = (divDiff[i + 1][j - 1] - divDiff[i][j - 1]) / (x[i + j] - x[i])
      }
    }
  }

  // Hitung nilai interpolasi menggunakan polinomial Newton
  let hasil = divDiff[0][0]
  let term = 1

  for (let j = 1; j < n; j++) {
    term *= xTarget - x[j - 1]
    hasil += divDiff[0][j] * term
  }

  // Pastikan hasil tidak negatif untuk harga
  return Math.max(0, hasil)
}

/**
 * Implementasi Metode Regresi Linier
 *
 * @param x Array tahun data historis
 * @param y Array harga beras rata-rata tahunan
 * @param tahun Tahun yang akan diprediksi
 * @param bulan Bulan yang akan diprediksi (1-12)
 * @returns Hasil prediksi harga beras
 */
export function regresiLinier(x: number[], y: number[], tahun: number, bulan: number): number {
  // Konversi tahun dan bulan ke format desimal (tahun.bulan)
  const xTarget = tahun + (bulan - 1) / 12

  const n = x.length

  // Hitung jumlah x, y, x^2, xy
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0

  for (let i = 0; i < n; i++) {
    sumX += x[i]
    sumY += y[i]
    sumXY += x[i] * y[i]
    sumX2 += x[i] * x[i]
  }

  // Hitung koefisien regresi
  const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const a = (sumY - b * sumX) / n

  // Prediksi menggunakan persamaan regresi y = a + b * xTarget
  const hasil = a + b * xTarget

  return hasil
}
