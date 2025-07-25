
"use client";

import * as React from "react";
import { conversations as initialConversations, users } from "@/lib/data";
import type { Conversation, Message } from "@/lib/types";
import ChatSidebar from "@/components/chat-sidebar";
import ChatPanel from "@/components/chat-panel";
import { useToast } from "@/hooks/use-toast";

export default function ChatPage() {
  const [conversations, setConversations] =
    React.useState<Conversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] =
    React.useState<Conversation | null>(conversations[0] || null);
  const { toast } = useToast();
  const currentUser = users[0];

  const handleSendMessage = (content: string) => {
    if (!selectedConversation) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: currentUser,
      content,
      timestamp: new Date().toISOString(),
    };

    const updatedConversations = conversations.map((convo) => {
      if (convo.id === selectedConversation.id) {
        return {
          ...convo,
          messages: [...convo.messages, newMessage],
        };
      }
      return convo;
    });

    setConversations(updatedConversations);
    setSelectedConversation(
      updatedConversations.find((c) => c.id === selectedConversation.id) || null
    );

    // Simulate a reply
    setTimeout(() => {
      const otherUser = selectedConversation.participants.find(
        (p) => p.id !== currentUser.id
      );
      if (otherUser) {
        const replyMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          sender: otherUser,
          content: "Got it, thanks!",
          timestamp: new Date().toISOString(),
        };

        const finalConversations = updatedConversations.map((convo) => {
          if (convo.id === selectedConversation.id) {
            return {
              ...convo,
              messages: [...convo.messages, replyMessage],
            };
          }
          return convo;
        });

        setConversations(finalConversations);
        setSelectedConversation(
          finalConversations.find((c) => c.id === selectedConversation.id) ||
            null
        );
        toast({
          title: `New message from ${otherUser.name}`,
          description: replyMessage.content,
        });
      }
    }, 1500);
  };

  return (
    <div className="flex h-screen w-full antialiased text-foreground bg-background">
      <ChatSidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
        currentUser={currentUser}
      />
      <ChatPanel
        conversation={selectedConversation}
        onSendMessage={handleSendMessage}
        currentUser={currentUser}
      />
    </div>
  );
}
