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
