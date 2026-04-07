import { Suspense } from "react"
import ResultsPageClient from "./ResultsPageClient"

function ResultsPageFallback() {
  return <div className="container mx-auto px-4 py-8">Loading interview results...</div>
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsPageFallback />}>
      <ResultsPageClient />
    </Suspense>
  )
}
