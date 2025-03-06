
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'

import HeaderSt from '@/components/HeaderSt'
import { Hero } from "@/components/Hero"
import { PrimaryFeatures } from "@/components/PrimaryFeatures.jsx"
import { SecondaryFeatures } from "@/components/SecondaryFeatures.jsx"
import { ExtraFeatures } from "@/components/ExtraFeatures.jsx"
import { Testimonials } from "@/components/Testimonials.jsx"
import { Faq } from "@/components/Faq.jsx"
import { Pricing } from "@/components/Pricing.jsx"
import { Footer } from "@/components/Footer.jsx"

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  return (
    <div className="min-h-screen bg-background">
      <HeaderSt />
      <Hero />
      <PrimaryFeatures />
      <Faq />
      {/* <Pricing /> */}
      <Footer />
    </div>
  )
}
