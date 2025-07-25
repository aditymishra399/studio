
import type { Conversation, User } from "@/lib/types";
import ConversationItem from "./conversation-item";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  currentUser: User;
}

export default function ConversationList({
  conversations,
  selectedConversation,
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
          isSelected={selectedConversation?.id === conversation.id}
          onSelect={() => onSelectConversation(conversation)}
          currentUser={currentUser}
        />
      ))}
    </nav>
  );
}
