
"use client";

import type { Conversation, User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BotMessageSquare, LogOut, Search } from "lucide-react";
import ConversationList from "./conversation-list";
import { users } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import UserSearchResults from "./user-search-results";

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  currentUser: User;
  searchQuery: string;
  searchResults: User[];
  onSearchChange: (query: string) => void;
  onSelectUser: (user: User) => void;
}

export default function ChatSidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
  currentUser,
  searchQuery,
  searchResults,
  onSearchChange,
  onSelectUser,
}: ChatSidebarProps) {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };
  
  const populatedConversations = conversations.map(convo => {
    const participants = convo.participantIds.map(id => {
      return users.find(u => u.id === id) || { id, name: "Unknown", avatarUrl: "" }
    }).filter(u => u.id !== currentUser.id) as User[];
    return { ...convo, participants };
  })

  return (
    <div className="hidden md:flex flex-col w-80 max-w-xs min-w-80 h-full bg-card border-r">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <BotMessageSquare className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">SilentLine</h1>
        </div>
        <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Search friends..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
      </div>
      <ScrollArea className="flex-1">
        {searchQuery ? (
            <UserSearchResults results={searchResults} onSelectUser={onSelectUser} />
        ) : (
            <ConversationList
            conversations={populatedConversations}
            selectedConversation={selectedConversation}
            onSelectConversation={onSelectConversation}
            currentUser={currentUser}
            />
        )}
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name || ""} data-ai-hint="user avatar" />
              <AvatarFallback>
                {currentUser.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{currentUser.name}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Log Out">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
