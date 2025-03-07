
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'

import HeaderSt from '@/components/HeaderSt'
import { Hero } from "@/components/Hero"
import { PrimaryFeatures } from "@/components/PrimaryFeatures.jsx"
import { Faq } from "@/components/Faq.jsx"
import { Pricing } from "@/components/Pricing.jsx"
import { Footer } from "@/components/Footer.jsx"
import { Header } from "@/components/Header.jsx"

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <PrimaryFeatures />
      <Faq />
      {/* <Pricing /> */}
      <Footer />
    </div>
  )
}
