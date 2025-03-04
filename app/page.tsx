
import { getServerSession } from 'next-auth'
import ScientificPaperFeed from "@/components/ScientificPaperFeed"
import Header from '@/components/Header'
import { authOptions } from './api/auth/[...nextauth]/route'

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
      </main>
    </div>
  )
}
