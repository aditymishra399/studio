
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
  const router = useRouter();

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
  
  const handleSelectConversation = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  }

  const handleCreateNewChat = () => {
    router.push('/chat/new');
  }
  
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
                onSelectConversation={(convo) => handleSelectConversation(convo.id)}
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
