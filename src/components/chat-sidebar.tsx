import type { Conversation, User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BotMessageSquare, Settings } from "lucide-react";
import ConversationList from "./conversation-list";

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  currentUser: User;
}

export default function ChatSidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
  currentUser,
}: ChatSidebarProps) {
  return (
    <div className="hidden md:flex flex-col w-80 max-w-xs min-w-80 h-full bg-card border-r">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <BotMessageSquare className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">SilentLine</h1>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={onSelectConversation}
          currentUser={currentUser}
        />
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="user avatar" />
              <AvatarFallback>
                {currentUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{currentUser.name}</span>
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
