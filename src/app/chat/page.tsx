
"use client";

import * as React from "react";
import type { Conversation, Message, User } from "@/lib/types";
import ChatSidebar from "@/components/chat-sidebar";
import ChatPanel from "@/components/chat-panel";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getConversations, sendMessage, createConversation, findExistingConversation, getAllUsers } from "@/services/firestore";

export default function ChatPage() {
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [allUsers, setAllUsers] = React.useState<User[]>([]);
  const [selectedConversation, setSelectedConversation] = React.useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<User[]>([]);
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
    const results = allUsers.filter(u =>
        u.name?.toLowerCase().includes(query.toLowerCase()) && u.id !== appUser.id
    );
    setSearchResults(results);
  };
  
  const handleSelectUserFromSearch = async (user: User) => {
    if (!appUser) return;
    
    const existingConversation = await findExistingConversation(appUser.id, user.id);
    
    if (existingConversation) {
        handleSelectConversation(existingConversation);
    } else {
        const newConversation = await createConversation(appUser, user);
        // The listener will pick up the new conversation, so we just need to select it.
        // To make it feel faster, we can manually add it to the state.
        setConversations(prev => [...prev, newConversation]);
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
