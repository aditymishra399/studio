"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full">
        <div className="hidden md:flex flex-col w-80 max-w-xs min-w-80 h-full bg-card border-r p-4 space-y-4">
           <Skeleton className="h-10 w-48" />
           <div className="flex-1 space-y-2">
            {[...Array(5)].map((_,i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
           </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
        </div>
        <div className="flex-1 flex flex-col h-screen">
          <div className="flex items-center justify-between p-4 border-b bg-card">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
          <div className="flex-1 p-6 space-y-6">
            <div className="flex items-end gap-3 justify-start">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-16 w-64 rounded-2xl" />
            </div>
            <div className="flex items-end gap-3 justify-end">
                <Skeleton className="h-16 w-48 rounded-2xl" />
            </div>
            <div className="flex items-end gap-3 justify-start">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-24 w-80 rounded-2xl" />
            </div>
          </div>
          <div className="p-4 border-t bg-card">
              <Skeleton className="h-20 w-full rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
