
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
  limit,
  getDocs
} from "firebase/firestore";
import type { Conversation, Message, User } from "@/lib/types";
import { users } from "@/lib/data";

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
    id: new Date().toISOString(), // simple unique id
    senderId,
    content,
    timestamp: new Date(),
  };

  await updateDoc(conversationRef, {
    messages: arrayUnion(messageData),
    lastMessage: messageData
  });
};

export const createConversation = async (currentUser: User, otherUser: User): Promise<Conversation> => {
    const conversationRef = collection(db, "conversations");
    
    const newConversationData = {
        participantIds: [currentUser.id, otherUser.id],
        messages: [],
        lastMessage: null,
        createdAt: serverTimestamp(),
    }
    const docRef = await addDoc(conversationRef, newConversationData);
    
    const participants = [currentUser, otherUser];

    return { 
        id: docRef.id, 
        ...newConversationData, 
        participants,
        lastMessage: null, // ensure it's not undefined
        messages: []      // ensure it's not undefined
    } as Conversation;
}

export const findExistingConversation = async (currentUserId: string, otherUserId: string): Promise<Conversation | null> => {
    const conversationsRef = collection(db, "conversations");
    // This query looks for conversations where both users are participants.
    const q = query(
        conversationsRef, 
        where("participantIds", "==", [currentUserId, otherUserId])
    );
    const q2 = query(
        conversationsRef,
        where("participantIds", "==", [otherUserId, currentUserId])
    );

    const querySnapshot = await getDocs(q);
    const querySnapshot2 = await getDocs(q2);

    let foundConversation: Conversation | null = null;
    
    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        foundConversation = { id: doc.id, ...doc.data() } as Conversation;
    } else if (!querySnapshot2.empty) {
        const doc = querySnapshot2.docs[0];
        foundConversation = { id: doc.id, ...doc.data() } as Conversation;
    }
    
    if (foundConversation) {
         const participants = foundConversation.participantIds.map(id => {
            return users.find(u => u.id === id);
        }).filter(u => u) as User[];
        return { ...foundConversation, participants };
    }

    return null;
}
