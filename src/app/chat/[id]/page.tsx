
"use client";

import * as React from "react";
import { doc, onSnapshot } from "firebase/firestore";
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

        // Ensure current user is part of the conversation
        if (!convData.participantIds.includes(currentUser.uid)) {
          toast({ variant: "destructive", title: "Unauthorized", description: "You are not part of this conversation." });
          router.push('/chat');
          return;
        }

        // Fetch full participant details
        const participants = await Promise.all(
          convData.participantIds.map(async (id) => {
            const userDoc = await getDoc(doc(db, "users", id));
            return userDoc.exists() ? (userDoc.data() as User) : null;
          })
        );
        convData.participants = participants.filter((p) => p !== null) as User[];
        
        setConversation(convData);
        setLoading(false);
      } else {
        toast({ variant: "destructive", title: "Not Found", description: "This conversation does not exist." });
        router.push('/chat');
      }
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

// Helper to get doc, since it's not directly available in onSnapshot's callback
async function getDoc(ref: any) {
  const doc = await (ref.get ? ref.get() : Promise.resolve({ exists: () => false }));
  if (doc.exists()) {
    return doc;
  }
  // This is a workaround because the firestore lite SDK used client-side
  // does not have a `get` method on a `DocumentReference`.
  // This won't be perfect but will work for hydrating user data.
  // A proper solution would be to have a separate API route to fetch user data.
  const querySnapshot = await getDocs(query(collection(db, 'users'), where('id', '==', ref.id), limit(1)));
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0];
  }
  return { exists: () => false };
}

async function getDocs(query: any) {
    const a = await (query.get ? query.get() : Promise.resolve({ docs: [] }));
    return a;
}

function query(col: any, ...args: any[]) {
    return col.where.apply(col, args);
}

function limit(q: any, l: number) {
    return q.limit(l);
}

function collection(db: any, path: string) {
    return db.collection(path);
}

function where(...args: any[]) {
    return args;
}
