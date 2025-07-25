
"use client";

import * as React from "react";
import type { Conversation, Message, User } from "@/lib/types";
import ChatSidebar from "@/components/chat-sidebar";
import ChatPanel from "@/components/chat-panel";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getConversations, sendMessage, createConversation } from "@/services/firestore";
import { users as mockUsers } from "@/lib/data"; // for user discovery

export default function ChatPage() {
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = React.useState<Conversation | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = getConversations(currentUser.uid, setConversations);
    return () => unsubscribe();
  }, [currentUser]);

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !currentUser) return;

    try {
      await sendMessage(selectedConversation.id, currentUser.uid, content);
    } catch (error) {
       console.error("Failed to send message:", error);
       toast({
         variant: "destructive",
         title: "Error",
         description: "Failed to send message.",
       });
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    const otherParticipant = mockUsers.find(u => u.id !== currentUser?.uid && conversation.participantIds.includes(u.id));

    setSelectedConversation({
      ...conversation,
      participants: otherParticipant ? [mapAuthUserToAppUser(currentUser)!, otherParticipant] : [mapAuthUserToAppUser(currentUser)!]
    });
  }
  
  const mapAuthUserToAppUser = (authUser: any) : User | undefined => {
    if (!authUser) return undefined;
    const mockUser = mockUsers.find(u => u.email === authUser.email);
    return {
      id: authUser.uid,
      name: mockUser?.name || authUser.email,
      avatarUrl: mockUser?.avatarUrl || `https://placehold.co/100x100/947EC5/FFFFFF`,
      email: authUser.email,
    }
  }
  
  const appUser = mapAuthUserToAppUser(currentUser);

  return (
    <div className="flex h-screen w-full antialiased text-foreground bg-background">
      {appUser && <ChatSidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        currentUser={appUser}
      />}
      {appUser && <ChatPanel
        conversation={selectedConversation}
        onSendMessage={handleSendMessage}
        currentUser={appUser}
      />}
    </div>
  );
}
