'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from './ui/button'

export default function HeaderSt() {
  const { data: session } = useSession()
  const pathname = usePathname()
  
  // Skip rendering header on auth pages
  if (pathname.startsWith('/auth/')) {
    return null
  }

  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold">
              PaperFeed
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-10">
            <Link 
              href="/" 
              className={`${pathname === '/' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'} transition`}
            >
              Home
            </Link>
            <Link 
              href="/papers" 
              className={`${pathname === '/papers' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'} transition`}
            >
              Papers
            </Link>
          </nav>
          
          <div className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {session.user.name || session.user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="space-x-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/signin">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}