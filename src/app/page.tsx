
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Fingerprint } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/chat');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col min-h-screen bg-background items-center justify-center">
       <Fingerprint className="w-16 h-16 text-primary animate-pulse" />
       <p className="text-muted-foreground mt-4">Loading your secure session...</p>
    </div>
  );
}
