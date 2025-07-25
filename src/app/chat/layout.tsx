
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Phone, User as UserIcon, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);
  
  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const isChatPage = pathname === '/chat';
  const isNewChatPage = pathname === '/chat/new';
  const isProfilePage = pathname === '/chat/profile';
  const showBackButton = !isChatPage && !isProfilePage;
  const isConversationPage = /^\/chat\/.+/.test(pathname) && !isNewChatPage && !isProfilePage;

  const title = useMemo(() => {
    if (isNewChatPage) return 'New Chat';
    if (isProfilePage) return 'Profile';
    if (isChatPage) return 'SilentLine';
    if (isConversationPage) return ''; // Title will be handled by the ChatHeader component
    return 'SilentLine';
  }, [pathname, isNewChatPage, isProfilePage, isChatPage, isConversationPage]);


  if (loading || !user) {
    return (
      <div className="flex flex-col h-screen w-full bg-background">
        <div className="flex items-center justify-between p-4 border-b">
           <Skeleton className="h-8 w-32" />
           <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-8 w-8 rounded-full" />
           </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(8)].map((_, i) => (
             <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                 <Skeleton className="h-4 w-12" />
              </div>
          ))}
        </div>
         <div className="fixed bottom-16 right-4">
            <Skeleton className="h-14 w-14 rounded-full" />
        </div>
        <div className="flex justify-around p-2 border-t bg-background">
          <Skeleton className="h-10 w-16 rounded-md" />
          <Skeleton className="h-10 w-16 rounded-md" />
          <Skeleton className="h-10 w-16 rounded-md" />
          <Skeleton className="h-10 w-16 rounded-md" />
        </div>
      </div>
    );
  }

  return (
      <div className="flex flex-col h-screen w-full bg-background text-foreground">
        {!isConversationPage && (
          <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
              <div className="flex items-center gap-4">
                {showBackButton && (
                  <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-6 h-6" />
                  </Button>
                )}
                 <h1 className="text-2xl font-bold text-primary tracking-tight">
                  {title}
                 </h1>
              </div>
              <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => router.push('/chat/new')}>
                      <Search className="w-5 h-5"/>
                  </Button>
                   <Avatar className="h-8 w-8">
                     <AvatarImage src={user.photoURL || undefined} alt="User avatar" data-ai-hint="person face" />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                   </Avatar>
              </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto pb-20">
            {children}
        </main>
        
        <nav className="flex justify-around p-2 border-t bg-background fixed bottom-0 w-full">
            <Link href="/chat" className={cn("flex flex-col items-center gap-1 rounded-lg p-2 transition-colors", pathname.startsWith('/chat') && !pathname.includes('/chat/profile') ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
                <MessageSquare className="w-6 h-6"/>
                <span className="text-xs font-medium">Chats</span>
            </Link>
             <Link href="#" className="flex flex-col items-center gap-1 rounded-lg p-2 text-muted-foreground hover:text-foreground transition-colors relative">
                <Users className="w-6 h-6"/>
                <span className="text-xs font-medium">Updates</span>
                <Badge variant="secondary" className="absolute top-0 right-0 text-xs px-1 py-0">Soon</Badge>
            </Link>
             <Link href="#" className="flex flex-col items-center gap-1 rounded-lg p-2 text-muted-foreground hover:text-foreground transition-colors relative">
                <Phone className="w-6 h-6"/>
                <span className="text-xs font-medium">Calls</span>
                 <Badge variant="secondary" className="absolute top-0 right-0 text-xs px-1 py-0">Soon</Badge>
            </Link>
            <Link href="/chat/profile" className={cn("flex flex-col items-center gap-1 rounded-lg p-2 transition-colors", pathname === '/chat/profile' ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
                <UserIcon className="w-6 h-6"/>
                <span className="text-xs font-medium">Profile</span>
            </Link>
        </nav>
      </div>
  );
}
