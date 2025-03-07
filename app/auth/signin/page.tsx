import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import SignInForm from "./SignInForm";
import { authOptions } from "@/lib/auth";

// In Next.js, page components receive searchParams directly
export default async function SignIn({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  // Redirect to home if already signed in
  if (session) {
    redirect("/");
  }

  const isNewRegistration = searchParams?.registered === "true";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>

          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to access PaperFeed
          </p>

          {isNewRegistration && (
            <div className="mt-4 p-3 text-sm text-white bg-green-500 rounded-lg">
              Account created successfully! Please sign in with your
              credentials.
            </div>
          )}
        </div>

        <SignInForm />
      </div>
    </div>
  );
}
