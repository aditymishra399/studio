
"use client";

import * as React from "react";
import type { Conversation, User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getConversations, sendMessage, createConversation, findExistingConversation, getAllUsers } from "@/services/firestore";
import ConversationList from "@/components/conversation-list";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import ChatPanel from "@/components/chat-panel";

export default function ChatPage() {
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [allUsers, setAllUsers] = React.useState<User[]>([]);
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!currentUser) return;

    const unsubscribeConvos = getConversations(currentUser.uid, (convos) => {
        setConversations(convos);
    });
    
    const unsubscribeUsers = getAllUsers((users) => {
        setAllUsers(users);
    });

    return () => {
        unsubscribeConvos();
        unsubscribeUsers();
    };
  }, [currentUser]);

  const mapAuthUserToAppUser = (authUser: any) : User | undefined => {
      if (!authUser) return undefined;
      const appUser = allUsers.find(u => u.id === authUser.uid);
      return appUser || {
          id: authUser.uid,
          name: authUser.displayName || authUser.email,
          avatarUrl: authUser.photoURL || `https://placehold.co/100x100/947EC5/FFFFFF`,
          email: authUser.email,
      };
  }

  const appUser = mapAuthUserToAppUser(currentUser);
  
  const selectedConversation = conversations.find(c => c.id === selectedConversationId) || null;

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !appUser) return;

    try {
      await sendMessage(selectedConversation.id, appUser.id, content);
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
    // We will render the chat panel as a separate page now
    // For now, we will just log this.
    console.log("Selected conversation", conversation.id)
    // A better approach would be to navigate to /chat/[id]
  }

  const handleCreateNewChat = () => {
    // This could open a modal to select a user, or navigate to a new page
    // For now, let's just log it
    console.log("Create new chat");
    // A simple implementation could be to pick a random user to chat with
    if (appUser) {
        const otherUsers = allUsers.filter(u => u.id !== appUser.id);
        if (otherUsers.length > 0) {
            handleSelectUserFromSearch(otherUsers[Math.floor(Math.random() * otherUsers.length)]);
        }
    }
  }

  const handleSelectUserFromSearch = async (user: User) => {
    if (!appUser) return;
    
    const existingConversation = await findExistingConversation(appUser.id, user.id);
    
    if (existingConversation) {
        handleSelectConversation(existingConversation);
    } else {
        const newConversation = await createConversation(appUser, user);
        setConversations(prev => [...prev, newConversation]);
        handleSelectConversation(newConversation);
    }
  };
  
  const populatedConversations = conversations.map(convo => {
    const otherParticipants = convo.participants?.filter(u => u.id !== appUser?.id);
    return { ...convo, participants: otherParticipants || [] };
  });


  return (
    <div className="relative h-full">
        {appUser && (
        <>
            <ConversationList
                conversations={populatedConversations}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
                currentUser={appUser}
            />
            <div className="fixed bottom-24 right-4">
                <Button size="icon" className="rounded-full h-14 w-14 shadow-lg" onClick={handleCreateNewChat}>
                    <MessageSquarePlus className="h-6 w-6" />
                </Button>
            </div>
        </>
        )}
    </div>
  );
}
