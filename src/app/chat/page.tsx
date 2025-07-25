
"use client";

import * as React from "react";
import type { Conversation, Message, User } from "@/lib/types";
import ChatSidebar from "@/components/chat-sidebar";
import ChatPanel from "@/components/chat-panel";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getConversations, sendMessage, createConversation, findExistingConversation } from "@/services/firestore";
import { users as mockUsers } from "@/lib/data"; // for user discovery

export default function ChatPage() {
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = React.useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<User[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = getConversations(currentUser.uid, (convos) => {
        const populatedConvos = convos.map(convo => {
            const participants = convo.participantIds.map(id => {
                return mockUsers.find(u => u.id === id);
            }).filter(u => u) as User[];
            return { ...convo, participants };
        });
        setConversations(populatedConvos);
    });
    return () => unsubscribe();
  }, [currentUser]);

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
    setSelectedConversation(conversation);
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '' || !appUser) {
        setSearchResults([]);
        return;
    }
    const results = mockUsers.filter(u =>
        u.name?.toLowerCase().includes(query.toLowerCase()) && u.id !== appUser.id
    );
    setSearchResults(results);
  };
  
  const handleSelectUserFromSearch = async (user: User) => {
    if (!appUser) return;
    
    // Check if a conversation with this user already exists
    const existingConversation = await findExistingConversation(appUser.id, user.id);
    
    if (existingConversation) {
        handleSelectConversation(existingConversation);
    } else {
        // Create a new conversation
        const newConversation = await createConversation(appUser, user);
        handleSelectConversation(newConversation);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="flex h-screen w-full antialiased text-foreground bg-background">
      {appUser && <ChatSidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        currentUser={appUser}
        searchQuery={searchQuery}
        searchResults={searchResults}
        onSearchChange={handleSearchChange}
        onSelectUser={handleSelectUserFromSearch}
      />}
      {appUser && <ChatPanel
        conversation={selectedConversation}
        onSendMessage={handleSendMessage}
        currentUser={appUser}
      />}
    </div>
  );
}
