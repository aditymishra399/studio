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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const getSender = (senderId: string) => {
    return participants.find(p => p.id === senderId);
  }

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
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
