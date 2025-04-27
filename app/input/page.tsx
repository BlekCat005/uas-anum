"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, PlusIcon, TrashIcon } from "lucide-react"
import DataChart from "@/components/data-chart"
import PredictionChart from "@/components/prediction-chart"
import { interpolasiNewton, regresiLinier } from "@/lib/metode-prediksi"
import { MainNav } from "@/components/main-nav"

export default function InputPage() {
  const [tahunPrediksi, setTahunPrediksi] = useState<number>(0)
  const [bulanPrediksi, setBulanPrediksi] = useState<number>(1)
  const [hasilNewton, setHasilNewton] = useState<number | null>(null)
  const [hasilRegresi, setHasilRegresi] = useState<number | null>(null)
  const [prediksiTahunan, setPrediksiTahunan] = useState<{ newton: number[]; regresi: number[] }[]>([])

  // Data input manual
  const [inputData, setInputData] = useState<{ tahun: number; harga: number }[]>([
    { tahun: 2015, harga: 10.5 },
    { tahun: 2016, harga: 11.5 },
    { tahun: 2017, harga: 11.5 },
    { tahun: 2018, harga: 12.0 },
    { tahun: 2019, harga: 12.1 },
    { tahun: 2020, harga: 12.2 },
  ])

  // Menentukan tahun prediksi berdasarkan data input
  useEffect(() => {
    if (inputData.length > 0) {
      // Urutkan data berdasarkan tahun
      const sortedData = [...inputData].sort((a, b) => a.tahun - b.tahun)
      // Ambil tahun terakhir dan tambahkan 1 untuk tahun prediksi
      const lastYear = sortedData[sortedData.length - 1].tahun
      setTahunPrediksi(lastYear + 1)
    }
  }, [inputData])

  // Menghitung prediksi untuk tahun berikutnya (semua bulan)
  useEffect(() => {
    if (inputData.length > 0 && tahunPrediksi > 0) {
      // Urutkan data berdasarkan tahun
      const sortedData = [...inputData].sort((a, b) => a.tahun - b.tahun)

      const tahunData = sortedData.map((d) => d.tahun)
      const hargaData = sortedData.map((d) => d.harga)

      // Filter data untuk interpolasi Newton (hanya 4 tahun terakhir)
      const tahunDataNewton = tahunData.slice(-4)
      const hargaDataNewton = hargaData.slice(-4)

      const prediksiTahunIni = {
        newton: Array(12)
          .fill(0)
          .map((_, i) =>
            tahunDataNewton.length >= 2 ? interpolasiNewton(tahunDataNewton, hargaDataNewton, tahunPrediksi, i + 1) : 0,
          ),
        regresi: Array(12)
          .fill(0)
          .map((_, i) => (tahunData.length >= 2 ? regresiLinier(tahunData, hargaData, tahunPrediksi, i + 1) : 0)),
      }

      const prediksiTahunDepan = {
        newton: Array(12)
          .fill(0)
          .map((_, i) =>
            tahunDataNewton.length >= 2
              ? interpolasiNewton(tahunDataNewton, hargaDataNewton, tahunPrediksi + 1, i + 1)
              : 0,
          ),
        regresi: Array(12)
          .fill(0)
          .map((_, i) => (tahunData.length >= 2 ? regresiLinier(tahunData, hargaData, tahunPrediksi + 1, i + 1) : 0)),
      }

      setPrediksiTahunan([prediksiTahunIni, prediksiTahunDepan])
    }
  }, [inputData, tahunPrediksi])

  const handlePrediksi = () => {
    if (inputData.length > 0) {
      // Urutkan data berdasarkan tahun
      const sortedData = [...inputData].sort((a, b) => a.tahun - b.tahun)

      const tahunData = sortedData.map((d) => d.tahun)
      const hargaData = sortedData.map((d) => d.harga)

      // Filter data untuk interpolasi Newton (hanya 4 tahun terakhir)
      const tahunDataNewton = tahunData.slice(-4)
      const hargaDataNewton = hargaData.slice(-4)

      if (tahunDataNewton.length >= 2 && tahunData.length >= 2) {
        const hasilN = interpolasiNewton(tahunDataNewton, hargaDataNewton, tahunPrediksi, bulanPrediksi)
        const hasilR = regresiLinier(tahunData, hargaData, tahunPrediksi, bulanPrediksi)

        setHasilNewton(hasilN)
        setHasilRegresi(hasilR)
      } else {
        alert("Minimal diperlukan 2 data untuk melakukan prediksi")
      }
    }
  }

  const handleAddInput = () => {
    if (inputData.length < 10) {
      // Jika ada data, tambahkan tahun berikutnya, jika tidak mulai dari 2015
      const lastYear = inputData.length > 0 ? Math.max(...inputData.map((d) => d.tahun)) + 1 : 2015
      setInputData([...inputData, { tahun: lastYear, harga: 0 }])
    } else {
      alert("Maksimal 10 data input")
    }
  }

  const handleRemoveInput = (index: number) => {
    const newData = [...inputData]
    newData.splice(index, 1)
    setInputData(newData)
  }

  const handleInputChange = (index: number, field: "tahun" | "harga", value: string) => {
    const newData = [...inputData]
    if (field === "tahun") {
      newData[index].tahun = Number.parseInt(value) || 0
    } else {
      newData[index].harga = Number.parseFloat(value) || 0
    }
    setInputData(newData)
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
        <h1 className="text-3xl font-bold text-center mb-8">Analisa Numerik: Prediksi Harga Beras (Input Manual)</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Input Data Harga Beras</CardTitle>
              <CardDescription>Masukkan data historis harga beras (maksimal 10 data)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tahun</TableHead>
                        <TableHead>Harga (Ribu Rupiah)</TableHead>
                        <TableHead className="w-[100px]">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inputData.map((data, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Input
                              type="number"
                              value={data.tahun}
                              onChange={(e) => handleInputChange(index, "tahun", e.target.value)}
                              min="1900"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={data.harga}
                              onChange={(e) => handleInputChange(index, "harga", e.target.value)}
                              step="0.001"
                              min="0"
                            />
                          </TableCell>
                          <TableCell>
                            <Button variant="destructive" size="icon" onClick={() => handleRemoveInput(index)}>
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleAddInput} disabled={inputData.length >= 10}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Tambah Data
                  </Button>
                  <div className="text-sm text-muted-foreground">{inputData.length}/10 data</div>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="tahun">Tahun Prediksi</Label>
                      <Input type="number" id="tahun" value={tahunPrediksi} disabled className="bg-gray-100" />
                      <p className="text-xs text-muted-foreground">Tahun setelah data terakhir yang diinput</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bulan">Bulan Prediksi</Label>
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

                  <Button onClick={handlePrediksi} className="w-full">
                    Prediksi Harga
                  </Button>
                </div>

                {hasilNewton !== null && hasilRegresi !== null && (
                  <div className="mt-4">
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
              <CardTitle>Visualisasi Data</CardTitle>
              <CardDescription>Grafik data input dan hasil prediksi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {inputData.length > 0 ? (
                  <DataChart data={inputData.sort((a, b) => a.tahun - b.tahun)} />
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p>Belum ada data untuk divisualisasikan</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="prediksi" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prediksi">Hasil Prediksi</TabsTrigger>
            <TabsTrigger value="metode">Penjelasan Metode</TabsTrigger>
          </TabsList>

          <TabsContent value="prediksi" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  Prediksi Harga Beras {tahunPrediksi}-{tahunPrediksi + 1}
                </CardTitle>
                <CardDescription>Perbandingan hasil prediksi menggunakan dua metode</CardDescription>
              </CardHeader>
              <CardContent>
                {prediksiTahunan.length > 0 && inputData.length >= 2 ? (
                  <div className="space-y-8">
                    <div className="h-[300px]">
                      <PredictionChart
                        dataHistoris={inputData.sort((a, b) => a.tahun - b.tahun)}
                        prediksiNewton={[
                          { tahun: tahunPrediksi, harga: prediksiTahunan[0].newton.reduce((a, b) => a + b, 0) / 12 },
                          {
                            tahun: tahunPrediksi + 1,
                            harga: prediksiTahunan[1].newton.reduce((a, b) => a + b, 0) / 12,
                          },
                        ]}
                        prediksiRegresi={[
                          { tahun: tahunPrediksi, harga: prediksiTahunan[0].regresi.reduce((a, b) => a + b, 0) / 12 },
                          {
                            tahun: tahunPrediksi + 1,
                            harga: prediksiTahunan[1].regresi.reduce((a, b) => a + b, 0) / 12,
                          },
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Prediksi {tahunPrediksi}</h3>
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
                        <h3 className="text-lg font-semibold mb-2">Prediksi {tahunPrediksi + 1}</h3>
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
                    <p>Minimal diperlukan 2 data untuk menampilkan prediksi</p>
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
                    depan berdasarkan data historis <strong>4 data terakhir</strong> yang diinputkan. Penggunaan data
                    terbaru ini memungkinkan prediksi yang lebih akurat karena lebih mencerminkan tren pasar terkini.
                  </p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-2">
                    <p className="text-sm">
                      <strong>Catatan:</strong> Metode Interpolasi Newton hanya menggunakan 4 data terakhir (berdasarkan
                      urutan tahun), sedangkan Metode Regresi Linier menggunakan seluruh data yang diinputkan.
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
                    dengan asumsi bahwa tren harga beras mengikuti pola linier. Metode ini menggunakan seluruh data yang
                    diinputkan untuk mendapatkan gambaran tren jangka panjang.
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
