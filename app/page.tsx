"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import DataChart from "@/components/data-chart"
import PredictionChart from "@/components/prediction-chart"
import { dataHargaBeras } from "@/lib/data"
import { interpolasiNewton, regresiLinier } from "@/lib/metode-prediksi"
import { MainNav } from "@/components/main-nav"

export default function Home() {
  const [tahunPrediksi, setTahunPrediksi] = useState<number>(2025)
  const [bulanPrediksi, setBulanPrediksi] = useState<number>(1)
  const [hasilNewton, setHasilNewton] = useState<number | null>(null)
  const [hasilRegresi, setHasilRegresi] = useState<number | null>(null)
  const [prediksiTahunan, setPrediksiTahunan] = useState<{ newton: number[]; regresi: number[] }[]>([])
  const [dataRataRata, setDataRataRata] = useState<{ tahun: number; harga: number }[]>([])

  // Menghitung rata-rata harga beras per tahun
  useEffect(() => {
    const rataRata = Object.entries(dataHargaBeras).map(([tahun, harga]) => {
      const avg = harga.reduce((sum, val) => sum + val, 0) / harga.length
      return {
        tahun: Number.parseInt(tahun),
        harga: Number.parseFloat(avg.toFixed(3)),
      }
    })
    setDataRataRata(rataRata)
  }, [])

  // Menghitung prediksi untuk tahun 2025 dan 2026 (semua bulan)
  useEffect(() => {
    if (dataRataRata.length > 0) {
      const tahunData = dataRataRata.map((d) => d.tahun)
      const hargaData = dataRataRata.map((d) => d.harga)

      // Filter data untuk interpolasi Newton (hanya 4 tahun terakhir)
      const tahunDataNewton = tahunData.slice(-4)
      const hargaDataNewton = hargaData.slice(-4)

      const prediksi2025 = {
        newton: Array(12)
          .fill(0)
          .map((_, i) => interpolasiNewton(tahunDataNewton, hargaDataNewton, 2025, i + 1)),
        regresi: Array(12)
          .fill(0)
          .map((_, i) => regresiLinier(tahunData, hargaData, 2025, i + 1)),
      }

      const prediksi2026 = {
        newton: Array(12)
          .fill(0)
          .map((_, i) => interpolasiNewton(tahunDataNewton, hargaDataNewton, 2026, i + 1)),
        regresi: Array(12)
          .fill(0)
          .map((_, i) => regresiLinier(tahunData, hargaData, 2026, i + 1)),
      }

      setPrediksiTahunan([prediksi2025, prediksi2026])
    }
  }, [dataRataRata])

  const handlePrediksi = () => {
    if (dataRataRata.length > 0) {
      const tahunData = dataRataRata.map((d) => d.tahun)
      const hargaData = dataRataRata.map((d) => d.harga)

      // Filter data untuk interpolasi Newton (hanya 4 tahun terakhir)
      const tahunDataNewton = tahunData.slice(-4)
      const hargaDataNewton = hargaData.slice(-4)

      const hasilN = interpolasiNewton(tahunDataNewton, hargaDataNewton, tahunPrediksi, bulanPrediksi)
      const hasilR = regresiLinier(tahunData, hargaData, tahunPrediksi, bulanPrediksi)

      setHasilNewton(hasilN)
      setHasilRegresi(hasilR)
    }
  }

  const namaBulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MainNav />

      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Analisa Numerik: Prediksi Harga Beras</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Prediksi Harga Beras</CardTitle>
              <CardDescription>Masukkan tahun dan bulan untuk memprediksi harga beras</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tahun">Tahun</Label>
                    <Select
                      value={tahunPrediksi.toString()}
                      onValueChange={(val) => setTahunPrediksi(Number.parseInt(val))}
                    >
                      <SelectTrigger id="tahun">
                        <SelectValue placeholder="Pilih tahun" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bulan">Bulan</Label>
                    <Select
                      value={bulanPrediksi.toString()}
                      onValueChange={(val) => setBulanPrediksi(Number.parseInt(val))}
                    >
                      <SelectTrigger id="bulan">
                        <SelectValue placeholder="Pilih bulan" />
                      </SelectTrigger>
                      <SelectContent>
                        {namaBulan.map((bulan, index) => (
                          <SelectItem key={index} value={(index + 1).toString()}>
                            {bulan}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handlePrediksi}>Prediksi Harga</Button>

                {hasilNewton !== null && hasilRegresi !== null && (
                  <div className="mt-4 space-y-4">
                    <Alert>
                      <InfoIcon className="h-4 w-4" />
                      <AlertTitle>
                        Hasil Prediksi untuk {namaBulan[bulanPrediksi - 1]} {tahunPrediksi}
                      </AlertTitle>
                      <AlertDescription>
                        <div className="mt-2 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Interpolasi Newton</p>
                            <p className="text-2xl font-bold">
                              Rp{" "}
                              {hasilNewton.toLocaleString("id-ID", {
                                minimumFractionDigits: 3,
                                maximumFractionDigits: 3,
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Regresi Linier</p>
                            <p className="text-2xl font-bold">
                              Rp{" "}
                              {hasilRegresi.toLocaleString("id-ID", {
                                minimumFractionDigits: 3,
                                maximumFractionDigits: 3,
                              })}
                            </p>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Historis</CardTitle>
              <CardDescription>Rata-rata harga beras per tahun (2015-2024)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <DataChart data={dataRataRata} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="data" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="data">Data Historis</TabsTrigger>
            <TabsTrigger value="prediksi">Hasil Prediksi</TabsTrigger>
            <TabsTrigger value="metode">Penjelasan Metode</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Harga Beras 2015-2024</CardTitle>
                <CardDescription>Data harga beras bulanan dalam ribuan rupiah</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tahun</TableHead>
                        {namaBulan.map((bulan, index) => (
                          <TableHead key={index}>{bulan}</TableHead>
                        ))}
                        <TableHead>Rata-rata</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(dataHargaBeras).map(([tahun, harga]) => {
                        const avg = harga.reduce((sum, val) => sum + val, 0) / harga.length
                        return (
                          <TableRow key={tahun}>
                            <TableCell className="font-medium">{tahun}</TableCell>
                            {harga.map((nilai, index) => (
                              <TableCell key={index}>
                                {nilai.toLocaleString("id-ID", { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                              </TableCell>
                            ))}
                            <TableCell className="font-bold">
                              {avg.toLocaleString("id-ID", { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prediksi" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Prediksi Harga Beras 2025-2026</CardTitle>
                <CardDescription>Perbandingan hasil prediksi menggunakan dua metode</CardDescription>
              </CardHeader>
              <CardContent>
                {prediksiTahunan.length > 0 ? (
                  <div className="space-y-8">
                    <div className="h-[300px]">
                      <PredictionChart
                        dataHistoris={dataRataRata}
                        prediksiNewton={[
                          { tahun: 2025, harga: prediksiTahunan[0].newton.reduce((a, b) => a + b, 0) / 12 },
                          { tahun: 2026, harga: prediksiTahunan[1].newton.reduce((a, b) => a + b, 0) / 12 },
                        ]}
                        prediksiRegresi={[
                          { tahun: 2025, harga: prediksiTahunan[0].regresi.reduce((a, b) => a + b, 0) / 12 },
                          { tahun: 2026, harga: prediksiTahunan[1].regresi.reduce((a, b) => a + b, 0) / 12 },
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Prediksi 2025</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Bulan</TableHead>
                              <TableHead>Interpolasi Newton</TableHead>
                              <TableHead>Regresi Linier</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {namaBulan.map((bulan, index) => (
                              <TableRow key={index}>
                                <TableCell>{bulan}</TableCell>
                                <TableCell>
                                  {prediksiTahunan[0].newton[index].toLocaleString("id-ID", {
                                    minimumFractionDigits: 3,
                                    maximumFractionDigits: 3,
                                  })}
                                </TableCell>
                                <TableCell>
                                  {prediksiTahunan[0].regresi[index].toLocaleString("id-ID", {
                                    minimumFractionDigits: 3,
                                    maximumFractionDigits: 3,
                                  })}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell className="font-bold">Rata-rata</TableCell>
                              <TableCell className="font-bold">
                                {(prediksiTahunan[0].newton.reduce((a, b) => a + b, 0) / 12).toLocaleString("id-ID", {
                                  minimumFractionDigits: 3,
                                  maximumFractionDigits: 3,
                                })}
                              </TableCell>
                              <TableCell className="font-bold">
                                {(prediksiTahunan[0].regresi.reduce((a, b) => a + b, 0) / 12).toLocaleString("id-ID", {
                                  minimumFractionDigits: 3,
                                  maximumFractionDigits: 3,
                                })}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Prediksi 2026</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Bulan</TableHead>
                              <TableHead>Interpolasi Newton</TableHead>
                              <TableHead>Regresi Linier</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {namaBulan.map((bulan, index) => (
                              <TableRow key={index}>
                                <TableCell>{bulan}</TableCell>
                                <TableCell>
                                  {prediksiTahunan[1].newton[index].toLocaleString("id-ID", {
                                    minimumFractionDigits: 3,
                                    maximumFractionDigits: 3,
                                  })}
                                </TableCell>
                                <TableCell>
                                  {prediksiTahunan[1].regresi[index].toLocaleString("id-ID", {
                                    minimumFractionDigits: 3,
                                    maximumFractionDigits: 3,
                                  })}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell className="font-bold">Rata-rata</TableCell>
                              <TableCell className="font-bold">
                                {(prediksiTahunan[1].newton.reduce((a, b) => a + b, 0) / 12).toLocaleString("id-ID", {
                                  minimumFractionDigits: 3,
                                  maximumFractionDigits: 3,
                                })}
                              </TableCell>
                              <TableCell className="font-bold">
                                {(prediksiTahunan[1].regresi.reduce((a, b) => a + b, 0) / 12).toLocaleString("id-ID", {
                                  minimumFractionDigits: 3,
                                  maximumFractionDigits: 3,
                                })}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-40">
                    <p>Memuat data prediksi...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metode" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Metode Interpolasi Newton</CardTitle>
                  <CardDescription>Penjelasan dan implementasi metode</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Interpolasi Newton adalah metode untuk mencari nilai fungsi di antara titik-titik data yang
                    diketahui. Metode ini menggunakan polinomial Newton yang dibangun dari selisih terbagi (divided
                    differences).
                  </p>
                  <p>Rumus umum interpolasi Newton:</p>
                  <div className="bg-slate-100 p-4 rounded-md">
                    <p className="font-mono">
                      P(x) = f(x₀) + f[x₀,x₁](x-x₀) + f[x₀,x₁,x₂](x-x₀)(x-x₁) + ... +
                      f[x₀,x₁,...,xₙ](x-x₀)(x-x₁)...(x-xₙ₋₁)
                    </p>
                  </div>
                  <p>Dimana f[x₀,x₁,...,xₙ] adalah selisih terbagi orde-n.</p>
                  <p>
                    Dalam implementasi kita, kita menggunakan interpolasi Newton untuk memprediksi harga beras di masa
                    depan berdasarkan data historis <strong>4 tahun terakhir (2021-2024)</strong>. Penggunaan data
                    terbaru ini memungkinkan prediksi yang lebih akurat karena lebih mencerminkan tren pasar terkini.
                  </p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-2">
                    <p className="text-sm">
                      <strong>Catatan:</strong> Metode Interpolasi Newton hanya menggunakan data 4 tahun terakhir,
                      sedangkan Metode Regresi Linier menggunakan seluruh data historis (2015-2024).
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Metode Regresi Linier</CardTitle>
                  <CardDescription>Penjelasan dan implementasi metode</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Regresi Linier adalah metode statistik untuk memodelkan hubungan antara variabel dependen (y) dan
                    variabel independen (x) dalam bentuk persamaan linier.
                  </p>
                  <p>Rumus umum regresi linier:</p>
                  <div className="bg-slate-100 p-4 rounded-md">
                    <p className="font-mono">y = a + bx</p>
                    <p className="font-mono mt-2">b = (n∑xy - ∑x∑y) / (n∑x² - (∑x)²)</p>
                    <p className="font-mono mt-2">a = (∑y - b∑x) / n</p>
                  </div>
                  <p>Dimana:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>x dan y adalah variabel</li>
                    <li>a adalah intercept (konstanta)</li>
                    <li>b adalah slope (kemiringan)</li>
                    <li>n adalah jumlah data</li>
                  </ul>
                  <p>
                    Dalam implementasi kita, kita menggunakan regresi linier untuk memprediksi harga beras di masa depan
                    dengan asumsi bahwa tren harga beras mengikuti pola linier.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
