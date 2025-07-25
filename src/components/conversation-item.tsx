
import type { Conversation, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow, format } from 'date-fns';
import { memo, useMemo } from "react";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
  currentUser: User;
}

const ConversationItem = memo(function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  currentUser,
}: ConversationItemProps) {
  const otherParticipant = conversation.participants?.find(
    (p) => p.id !== currentUser.id
  );

  if (!otherParticipant) return null;

  const formattedTimestamp = useMemo(() => {
    const timestamp = conversation.lastMessage?.timestamp;
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    try {
        // if today, show time, else show day name or date
        const now = new Date();
        if (now.toDateString() === date.toDateString()) {
            return format(date, 'p');
        }
        return formatDistanceToNow(date, { addSuffix: true });
    } catch(e) {
        return '';
    }
  }, [conversation.lastMessage?.timestamp]);
  
  const unreadCount = 0; // Placeholder for unread count logic

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex items-start w-full text-left gap-4 p-3 rounded-lg transition-colors",
        isSelected
          ? "bg-primary/10"
          : "hover:bg-muted"
      )}
    >
      <Avatar className="w-12 h-12">
        <AvatarImage src={otherParticipant.avatarUrl} alt={otherParticipant.name || ""} data-ai-hint="person avatar" />
        <AvatarFallback>
          {otherParticipant.name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden border-b pb-3">
        <div className="flex justify-between items-center">
            <p className="font-semibold truncate text-base">{otherParticipant.name}</p>
            <p className={cn("text-xs", unreadCount > 0 ? "text-primary font-bold" : "text-muted-foreground")}>
              {formattedTimestamp}
            </p>
        </div>
        <div className="flex justify-between items-start">
            <p className={cn("text-sm truncate text-muted-foreground", isSelected ? 'text-primary/90' : 'text-muted-foreground')}>
            {conversation.lastMessage?.content || "No messages yet"}
            </p>
            {unreadCount > 0 && (
                <span className="flex items-center justify-center bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 font-bold">
                    {unreadCount}
                </span>
            )}
        </div>
      </div>
    </button>
  );
});

export default ConversationItem;
