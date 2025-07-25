
import type { Conversation, User } from "@/lib/types";
import ConversationItem from "./conversation-item";
import { memo } from "react";

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  currentUser: User;
}

const ConversationList = memo(function ConversationList({
  conversations,
  onSelectConversation,
  currentUser,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground h-full flex items-center justify-center">
        No conversations yet. Start one by clicking the new chat button.
      </div>
    );
  }
  return (
    <nav className="p-2 space-y-1">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isSelected={false} // Selection is handled by navigation now
          onSelect={() => onSelectConversation(conversation)}
          currentUser={currentUser}
        />
      ))}
    </nav>
  );
});

export default ConversationList;
