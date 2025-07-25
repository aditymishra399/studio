import type { Conversation, User } from "@/lib/types";
import ChatHeader from "./chat-header";
import MessageList from "./message-list";
import MessageInput from "./message-input";
import { MessageCircle } from "lucide-react";
import * as React from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";


interface ChatPanelProps {
  conversation: Conversation;
  onSendMessage: (content: string) => void;
  currentUser: User;
}

export default function ChatPanel({
  conversation,
  onSendMessage,
  currentUser,
}: ChatPanelProps) {
  const [currentConversation, setCurrentConversation] = React.useState(conversation);

  React.useEffect(() => {
    // When the conversation prop changes, update the state
    setCurrentConversation(conversation);

    // Set up the real-time listener
    const unsub = onSnapshot(doc(db, "conversations", conversation.id), (doc) => {
      if (doc.exists()) {
         const convData = { id: doc.id, ...doc.data() } as Conversation;
          // Important: Preserve the participants data from the initial prop
          // as it's not stored directly in the conversation document.
         setCurrentConversation({ ...convData, participants: conversation.participants });
      }
    });

    // Cleanup listener on component unmount or when conversation changes
    return () => unsub();
  }, [conversation]);


  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">No conversation selected</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a conversation from the sidebar to start messaging.
          </p>
        </div>
      </div>
    );
  }

  const otherParticipant = currentConversation.participants?.find(
    (p) => p.id !== currentUser.id
  );

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader user={otherParticipant} />
      <MessageList
        messages={currentConversation.messages || []}
        currentUser={currentUser}
        participants={currentConversation.participants || []}
      />
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
}
