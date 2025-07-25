import type { Message, User } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageItem from "./message-item";
import { useEffect, useRef } from "react";

interface MessageListProps {
  messages: Message[];
  currentUser: User;
  participants: User[];
}

export default function MessageList({ messages, currentUser, participants }: MessageListProps) {
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (viewport) {
      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight;
      }, 0);
    }
  }, [messages]);

  const getSender = (senderId: string) => {
    return participants.find(p => p.id === senderId);
  }

  return (
    <ScrollArea className="flex-1" viewportRef={scrollViewportRef}>
      <div className="p-6 space-y-6">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isCurrentUser={message.senderId === currentUser.id}
            sender={getSender(message.senderId)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
