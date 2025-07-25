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
  timestamp: Date;
  sender?: User; // Optional: for UI, can be populated after fetching
}

export interface Conversation {
  id: string;
  participantIds: string[];
  messages: Message[];
  participants?: User[]; // Optional: for UI, can be populated after fetching
  lastMessage: Message | null;
}
