
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
  setDoc,
  writeBatch
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

// Check if a username is already taken
export const isUsernameTaken = async (name: string): Promise<boolean> => {
    const usersRef = collection(db, "users");
    // Use case-insensitive query if your Firestore setup supports it, otherwise this is case-sensitive.
    const q = query(usersRef, where("name", "==", name));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
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
    where("participantIds", "array-contains", userId),
    limit(50) // Limit to 50 most recent conversations
    // The orderBy clause is removed to prevent the composite index error.
    // We will sort the results on the client side.
    // orderBy("lastMessage.timestamp", "desc")
  );

  // Cache for user data to avoid repeated fetches
  const userCache = new Map<string, User>();

  const unsubscribe = onSnapshot(q, async (querySnapshot) => {
    const conversations: Conversation[] = [];
    for (const docSnapshot of querySnapshot.docs) {
      const conversationData = { id: docSnapshot.id, ...docSnapshot.data() } as Conversation;
      
      const participants = await Promise.all(
        conversationData.participantIds.map(async (id) => {
          // Check cache first
          if (userCache.has(id)) {
            return userCache.get(id)!;
          }
          
          const userDoc = await getDoc(doc(db, "users", id));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            userCache.set(id, userData);
            return userData;
          }
          return null;
        })
      );

      conversationData.participants = participants.filter(p => p !== null) as User[];
      conversations.push(conversationData);
    }
    
    // Sort conversations by last message timestamp on the client side
    conversations.sort((a, b) => {
      const dateA = a.lastMessage?.timestamp?.toDate ? a.lastMessage.timestamp.toDate() : new Date(0);
      const dateB = b.lastMessage?.timestamp?.toDate ? b.lastMessage.timestamp.toDate() : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    callback(conversations);
  });

  return unsubscribe;
};

// Send a message in a conversation
export const sendMessage = async (conversationId: string, senderId: string, content: string) => {
  const conversationRef = doc(db, "conversations", conversationId);
  const messageData = {
    id: doc(collection(db, "tmp")).id, // Generate a unique ID for the message
    senderId,
    content,
    timestamp: serverTimestamp(), // Use server timestamp for consistency
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
    
    // We can just return the ID, the conversation list listener will pick up the new conversation
    return { 
        id: docRef.id, 
        ...newConversationData, 
        participants: [currentUser, otherUser],
    } as Conversation;
}

export const findExistingConversation = async (currentUserId: string, otherUserId: string): Promise<Conversation | null> => {
    const conversationsRef = collection(db, "conversations");
    // participantIds are sorted, so we can build the exact array to query
    const sortedIds = [currentUserId, otherUserId].sort();
    
    const q = query(
        conversationsRef, 
        where("participantIds", "==", sortedIds),
        limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        // Don't need to populate participants here, it's just for navigation
        return { id: docSnapshot.id, ...docSnapshot.data() } as Conversation;
    }

    return null;
}
