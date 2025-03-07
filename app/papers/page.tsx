
import { getServerSession } from 'next-auth'
import ScientificPaperFeed from "@/components/ScientificPaperFeed"
import HeaderSt from '@/components/HeaderSt'
import { Header } from '@/components/Header'

export default async function Home() {
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ScientificPaperFeed />
    </div>
  )
}
