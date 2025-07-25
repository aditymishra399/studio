
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
  getDocs,
  setDoc
} from "firebase/firestore";
import type { Conversation, Message, User } from "@/lib/types";


// Create a user profile document in Firestore
export const createUserProfile = async (uid: string, name: string, email: string, avatarUrl: string) => {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
        id: uid,
        name,
        email,
        avatarUrl
    });
};

// Update a user profile document in Firestore
export const updateUserDocument = async (uid: string, data: Partial<User>) => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, data);
};


// Fetch all users for discovery (you might want to paginate this in a real app)
export const getAllUsers = (callback: (users: User[]) => void) => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const users: User[] = [];
        querySnapshot.forEach((doc) => {
            users.push(doc.data() as User);
        });
        callback(users);
    });
    return unsubscribe;
}


// Get all conversations for a user
export const getConversations = (userId: string, callback: (conversations: Conversation[]) => void) => {
  const q = query(
    collection(db, "conversations"),
    where("participantIds", "array-contains", userId)
  );

  const unsubscribe = onSnapshot(q, async (querySnapshot) => {
    const conversations: Conversation[] = [];
    for (const docSnapshot of querySnapshot.docs) {
      const conversationData = { id: docSnapshot.id, ...docSnapshot.data() } as Conversation;
      
      const participants = await Promise.all(
        conversationData.participantIds.map(async (id) => {
          const userDoc = await getDoc(doc(db, "users", id));
          return userDoc.exists() ? userDoc.data() as User : null;
        })
      );

      conversationData.participants = participants.filter(p => p !== null) as User[];
      conversations.push(conversationData);
    }
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
        participantIds: [currentUser.id, otherUser.id].sort(),
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
    const sortedIds = [currentUserId, otherUserId].sort();
    
    const q = query(
        conversationsRef, 
        where("participantIds", "==", sortedIds)
    );
    
    const querySnapshot = await getDocs(q);

    let foundConversation: Conversation | null = null;
    
    if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        foundConversation = { id: docSnapshot.id, ...docSnapshot.data() } as Conversation;
         const participants = await Promise.all(
            foundConversation.participantIds.map(async (id) => {
                const userDoc = await getDoc(doc(db, "users", id));
                return userDoc.exists() ? userDoc.data() as User : null;
            })
        );
        foundConversation.participants = participants.filter(u => u) as User[];
    }

    return foundConversation;
}
