import type { Conversation, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
  currentUser: User;
}

export default function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  currentUser,
}: ConversationItemProps) {
  const otherParticipant = conversation.participants.find(
    (p) => p.id !== currentUser.id
  );
  const lastMessage = conversation.messages[conversation.messages.length - 1];

  if (!otherParticipant) return null;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex items-center w-full text-left gap-3 p-3 rounded-lg transition-colors",
        isSelected
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted"
      )}
    >
      <Avatar className="w-12 h-12">
        <AvatarImage src={otherParticipant.avatarUrl} alt={otherParticipant.name} data-ai-hint="person avatar" />
        <AvatarFallback>
          {otherParticipant.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <p className="font-semibold truncate">{otherParticipant.name}</p>
        <p className={cn("text-sm truncate", isSelected ? 'text-primary/80' : 'text-muted-foreground')}>
          {lastMessage?.content || "No messages yet"}
        </p>
      </div>
    </button>
  );
}
