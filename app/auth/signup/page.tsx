import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import SignUpForm from './SignUpForm'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function SignUp() {
  const session = await getServerSession(authOptions)
  
  // Redirect to home if already signed in
  if (session) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign up to get started with PaperFeed
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}