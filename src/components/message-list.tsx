import type { Message, User } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageItem from "./message-item";
import { useEffect, useRef } from "react";

interface MessageListProps {
  messages: Message[];
  currentUser: User;
}

export default function MessageList({ messages, currentUser }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="p-6 space-y-6">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isCurrentUser={message.sender.id === currentUser.id}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
