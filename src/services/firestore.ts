import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  limit
} from "firebase/firestore";
import type { Conversation, Message } from "@/lib/types";

// Get all conversations for a user
export const getConversations = (userId: string, callback: (conversations: Conversation[]) => void) => {
  const q = query(
    collection(db, "conversations"),
    where("participantIds", "array-contains", userId)
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const conversations: Conversation[] = [];
    querySnapshot.forEach((doc) => {
      conversations.push({ id: doc.id, ...doc.data() } as Conversation);
    });
    callback(conversations);
  });

  return unsubscribe;
};

// Send a message in a conversation
export const sendMessage = async (conversationId: string, senderId: string, content: string) => {
  const conversationRef = doc(db, "conversations", conversationId);
  const messageData = {
    senderId,
    content,
    timestamp: new Date(),
  };

  await updateDoc(conversationRef, {
    messages: arrayUnion(messageData),
    lastMessage: messageData
  });
};

export const createConversation = async (currentUser: any, otherUser: any) => {
    const conversationRef = collection(db, "conversations");

    const newConversation = {
        participantIds: [currentUser.uid, otherUser.id],
        messages: [],
        lastMessage: null,
        createdAt: serverTimestamp(),
    }
    const docRef = await addDoc(conversationRef, newConversation);
    return { id: docRef.id, ...newConversation } as Conversation;
}
