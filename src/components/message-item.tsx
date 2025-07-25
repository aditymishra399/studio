
import type { Message, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Lock } from "lucide-react";
import * as React from "react";

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  sender: User | undefined;
}

export default function MessageItem({ message, isCurrentUser, sender }: MessageItemProps) {
  const [formattedTimestamp, setFormattedTimestamp] = React.useState("");

  React.useEffect(() => {
    if (message.timestamp) {
       // Firebase timestamps can be objects or seconds/nanoseconds.
       // This handles converting it to a JS Date object safely.
       const date = (message.timestamp as any).toDate ? (message.timestamp as any).toDate() : new Date();
       if (date instanceof Date && !isNaN(date.valueOf())) {
         setFormattedTimestamp(format(date, "p"));
       }
    }
  }, [message.timestamp]);
  
  if (!sender) {
    // Return a placeholder or null if sender info isn't available yet
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-end gap-3 animate-in fade-in-20 slide-in-from-bottom-4 duration-300",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      {!isCurrentUser && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={sender.avatarUrl} alt={sender.name || ""} data-ai-hint="person profile" />
          <AvatarFallback>
            {sender.name?.charAt(0).toUpperCase()}
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
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
          <Lock className="w-3 h-3" />
          {formattedTimestamp ? <span>{formattedTimestamp}</span> : null}
        </div>
      </div>
    </div>
  );
}
