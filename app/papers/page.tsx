
import { getServerSession } from 'next-auth'
import ScientificPaperFeed from "@/components/ScientificPaperFeed"
import HeaderSt from '@/components/HeaderSt'

export default async function Home() {
  
  return (
    <div className="min-h-screen bg-background">
      <HeaderSt />
      <main>
        <ScientificPaperFeed />
      </main>
    </div>
  )
}
