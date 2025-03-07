'use client'

import { SessionProvider } from 'next-auth/react'
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { throttle } from "@/lib/utils"

// Create UserCredits context
type UserCreditsContextType = {
  credits: number | null;
  loading: boolean;
  fetchCredits: () => Promise<void>;
};

const UserCreditsContext = createContext<UserCreditsContextType>({
  credits: null,
  loading: false,
  fetchCredits: async () => {},
});

export const useUserCredits = () => useContext(UserCreditsContext);

// UserCredits Provider Component
function UserCreditsProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Fetch credits function
  const fetchCredits = useCallback(async () => {
    if (!session?.user) {
      setCredits(null);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/user/credits');
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
      } else {
        console.error('Error fetching credits:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Throttle the fetchCredits function to prevent too many API calls
  const throttledFetchCredits = useCallback(
    throttle(fetchCredits, 5000), // Only allow once every 5 seconds
    [fetchCredits]
  );
  
  // Load credits on session change
  useEffect(() => {
    if (session?.user) {
      fetchCredits();
    } else {
      setCredits(null);
    }
  }, [session, fetchCredits]);
  
  return (
    <UserCreditsContext.Provider value={{ credits, loading, fetchCredits: throttledFetchCredits }}>
      {children}
    </UserCreditsContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
      <SessionProvider>
        <UserCreditsProvider>
          {children}
        </UserCreditsProvider>
      </SessionProvider>
  )
}