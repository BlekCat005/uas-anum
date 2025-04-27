import Link from "next/link"
import { Database, PenLine } from "lucide-react"

export function MainNav() {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">Prediksi Harga Beras</span>
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Database className="mr-2 h-4 w-4" />
              Data Historis
            </Link>
            <Link
              href="/input"
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <PenLine className="mr-2 h-4 w-4" />
              Input Manual
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
