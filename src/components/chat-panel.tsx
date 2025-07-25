import type { Conversation, User } from "@/lib/types";
import ChatHeader from "./chat-header";
import MessageList from "./message-list";
import MessageInput from "./message-input";
import { MessageCircle } from "lucide-react";

interface ChatPanelProps {
  conversation: Conversation | null;
  onSendMessage: (content: string) => void;
  currentUser: User;
}

export default function ChatPanel({
  conversation,
  onSendMessage,
  currentUser,
}: ChatPanelProps) {
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">No conversation selected</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a conversation from the sidebar to start messaging.
          </p>
        </div>
      </div>
    );
  }

  const otherParticipant = conversation.participants.find(
    (p) => p.id !== currentUser.id
  );

  return (
    <div className="flex-1 flex flex-col h-screen">
      <ChatHeader user={otherParticipant} />
      <MessageList
        messages={conversation.messages}
        currentUser={currentUser}
      />
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
}
