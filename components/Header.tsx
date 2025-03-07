"use client"

import { useState } from "react"
import { Bars2Icon, XMarkIcon } from "@heroicons/react/24/outline"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { SectionWrapper } from "@/components/Section"

// Modified links for PaperFeed
const links: any[] = [
]

function Navigation() {
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <div className="ml-auto hidden items-center gap-8 lg:flex">
      {links.map((link, index) => (
        <Link 
          key={index} 
          href={link.url} 
          className={`inline-block text-sm transition
            ${pathname === link.url ? 'text-white' : 'text-white/75 hover:text-white'}`}
        >
          {link.title}
        </Link>
      ))}

      {session ? (
        <div className="flex items-center space-x-4">
          <span className="text-sm text-white/90">
            {session.user.name || session.user.email}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="rounded-full bg-white/10 text-white hover:bg-white/15"
          >
            Sign out
          </Button>
        </div>
      ) : (
        <div className="space-x-2">
          <Button asChild variant="ghost" size="sm" className="text-white/80 hover:text-white">
            <Link href="/auth/signin">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full bg-white/10 text-white hover:bg-white/15">
            <Link href="/auth/signup">Sign up</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

interface MobileMenuProps {
  showMenu: boolean;
}

function MobileMenu({ showMenu }: MobileMenuProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    showMenu && (
      <div className="py-4">
        <ul className="flex flex-col items-center space-y-4">
          {links.map((link, index) => (
            <li key={index}>
              <Link
                href={link.url}
                className={`inline-block text-base font-medium transition
                  ${pathname === link.url ? 'text-white' : 'text-white/75 hover:text-white'}`}
              >
                {link.title}
              </Link>
            </li>
          ))}
          {session ? (
            <li className="flex flex-col items-center gap-4 pt-2">
              <span className="text-sm text-white/90">
                {session.user.name || session.user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="rounded-full bg-white/10 text-white hover:bg-white/15"
              >
                Sign out
              </Button>
            </li>
          ) : (
            <li className="flex flex-col items-center gap-3 pt-2">
              <Button asChild variant="ghost" size="sm" className="text-white/80 hover:text-white">
                <Link href="/auth/signin">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full bg-white/10 text-white hover:bg-white/15">
                <Link href="/auth/signup">Sign up</Link>
              </Button>
            </li>
          )}
        </ul>
      </div>
    )
  )
}

export function Header() {
  const [showMenu, setShowMenu] = useState(false)
  const pathname = usePathname()
  
  // Skip rendering header on auth pages
  if (pathname.startsWith('/auth/')) {
    return null
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 bg-zinc-950/30 backdrop-blur-lg">
      <SectionWrapper className={undefined}>
        <header>
          <nav className="flex items-center justify-between py-4">
            <div>
              <Link href="/" className="inline-flex items-center gap-2">
                <span className="text-lg font-bold text-white lg:text-2xl">PaperFeed-beta</span>
              </Link>
            </div>

            <Navigation />

            <button
              onClick={() => setShowMenu(!showMenu)}
              type="button"
              className="relative ml-auto inline-flex lg:hidden">
              <Bars2Icon className={`h-6 w-6 text-white transition duration-500 ${showMenu ? "rotate-180 opacity-0" : ""}`} />
              <XMarkIcon
                className={`absolute inset-0 h-6 w-6 text-white transition duration-500 ${
                  showMenu ? "" : "-rotate-180 opacity-0"
                }`}
              />
            </button>
          </nav>
        </header>

        <MobileMenu showMenu={showMenu} />
      </SectionWrapper>
    </div>
  )
}