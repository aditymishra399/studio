import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Lock } from "lucide-react";
import * as React from "react";

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
}

export default function MessageItem({ message, isCurrentUser }: MessageItemProps) {
  const [formattedTimestamp, setFormattedTimestamp] = React.useState("");

  React.useEffect(() => {
    setFormattedTimestamp(format(new Date(message.timestamp), "p"));
  }, [message.timestamp]);

  return (
    <div
      className={cn(
        "flex items-end gap-3 animate-in fade-in-20 slide-in-from-bottom-4 duration-300",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      {!isCurrentUser && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={message.sender.avatarUrl} alt={message.sender.name} data-ai-hint="person profile" />
          <AvatarFallback>
            {message.sender.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-md lg:max-w-xl p-3 rounded-2xl shadow-sm",
          isCurrentUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card text-card-foreground rounded-bl-md"
        )}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
          <Lock className="w-3 h-3" />
          {formattedTimestamp ? <span>{formattedTimestamp}</span> : null}
        </div>
      </div>
    </div>
  );
}
