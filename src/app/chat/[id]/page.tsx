
"use client";

import * as React from "react";
import { doc, onSnapshot, getDoc as getFirestoreDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import type { Conversation, User } from "@/lib/types";
import { sendMessage } from "@/services/firestore";
import { useToast } from "@/hooks/use-toast";

import ChatPanel from "@/components/chat-panel";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConversationPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const params = useParams();
  const conversationId = params.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const [conversation, setConversation] = React.useState<Conversation | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!currentUser || !conversationId) return;

    const convRef = doc(db, "conversations", conversationId);
    const unsubscribe = onSnapshot(convRef, async (doc) => {
      if (doc.exists()) {
        const convData = { id: doc.id, ...doc.data() } as Conversation;

        if (!convData.participantIds.includes(currentUser.uid)) {
          toast({ variant: "destructive", title: "Unauthorized", description: "You are not part of this conversation." });
          router.push('/chat');
          return;
        }

        try {
            const participants = await Promise.all(
              convData.participantIds.map(async (id) => {
                const userDocSnap = await getFirestoreDoc(doc(db, "users", id));
                return userDocSnap.exists() ? (userDocSnap.data() as User) : null;
              })
            );
            convData.participants = participants.filter((p) => p !== null) as User[];
            
            setConversation(convData);
        } catch(e) {
            console.error("Error fetching participants", e);
            toast({ variant: "destructive", title: "Error", description: "Could not load participant details." });
        }

        setLoading(false);
      } else {
        toast({ variant: "destructive", title: "Not Found", description: "This conversation does not exist." });
        router.push('/chat');
      }
    }, (error) => {
        console.error("Error in conversation snapshot listener:", error);
        toast({ variant: "destructive", title: "Error", description: "There was an error loading the conversation." });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, conversationId, router, toast]);

  const appUser = React.useMemo(() => {
    if (!currentUser || !conversation) return undefined;
    return conversation.participants.find(p => p.id === currentUser.uid);
  }, [currentUser, conversation]);

  const handleSendMessage = async (content: string) => {
    if (!conversationId || !appUser) return;

    try {
      await sendMessage(conversationId, appUser.id, content);
    } catch (error) {
       console.error("Failed to send message:", error);
       toast({
         variant: "destructive",
         title: "Error",
         description: "Failed to send message.",
       });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col h-screen">
          <div className="flex items-center justify-between p-4 border-b bg-card">
              <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-6 w-32" />
              </div>
              <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8" />
                   <Skeleton className="h-8 w-8" />
              </div>
          </div>
          <div className="flex-1 p-6 space-y-6">
              <div className="flex items-end gap-3 justify-start">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="w-48 h-12 rounded-2xl" />
              </div>
               <div className="flex items-end gap-3 justify-end">
                  <Skeleton className="w-64 h-16 rounded-2xl" />
              </div>
               <div className="flex items-end gap-3 justify-start">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="w-32 h-12 rounded-2xl" />
              </div>
          </div>
          <div className="p-4 border-t bg-card">
              <Skeleton className="h-12 w-full" />
          </div>
      </div>
    );
  }

  if (!conversation || !appUser) {
    return null; // Or some other error state
  }

  return (
    <ChatPanel
      conversation={conversation}
      onSendMessage={handleSendMessage}
      currentUser={appUser}
    />
  );
}
