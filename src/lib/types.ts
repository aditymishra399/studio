
export interface User {
  id: string;
  name: string | null;
  avatarUrl: string;
  email: string | null;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: any; // Using `any` for Firebase ServerTimestamp compatibility
  sender?: User; // Optional: for UI, can be populated after fetching
}

export interface Conversation {
  id: string;
  participantIds: string[];
  messages: Message[];
  participants: User[]; // No longer optional
  lastMessage: Message | null;
}
