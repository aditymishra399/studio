
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
    <div className="flex flex-col min-h-screen bg-background items-center justify-center font-sans">
       <Fingerprint className="w-20 h-20 text-primary animate-pulse" />
       <div className="mt-6 text-center">
            <h1 className="text-2xl font-semibold text-foreground tracking-wider">
                <span className="italic">We are</span> <span className="font-extrabold not-italic">human</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">...just checking a few things.</p>
       </div>
    </div>
  );
}
