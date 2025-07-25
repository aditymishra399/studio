
import type { Conversation, User } from "@/lib/types";
import ChatHeader from "./chat-header";
import MessageList from "./message-list";
import MessageInput from "./message-input";
import * as React from "react";

interface ChatPanelProps {
  conversation: Conversation;
  onSendMessage: (content: string) => void;
  currentUser: User;
}

export default function ChatPanel({
  conversation,
  onSendMessage,
  currentUser,
}: ChatPanelProps) {
  
  const otherParticipant = conversation.participants?.find(
    (p) => p.id !== currentUser.id
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader user={otherParticipant} />
      <div className="flex-1 flex flex-col">
          <MessageList
            messages={conversation.messages || []}
            currentUser={currentUser}
            participants={conversation.participants || []}
          />
          <MessageInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
}
