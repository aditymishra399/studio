import type { User } from './types';

// This is now primarily for user discovery, not for conversations.
export const users: User[] = [
  {
    id: 'user-1', // Note: This ID should correspond to a Firebase Auth UID in a real app
    name: 'You',
    email: 'you@example.com',
    avatarUrl: 'https://placehold.co/100x100/947EC5/FFFFFF',
  },
  {
    id: 'user-2', // Note: This ID should correspond to a Firebase Auth UID in a real app
    name: 'Alice',
    email: 'alice@example.com',
    avatarUrl: 'https://placehold.co/100x100/6660B2/FFFFFF',
  },
  {
    id: 'user-3',
    name: 'Bob',
    email: 'bob@example.com',
    avatarUrl: 'https://placehold.co/100x100/A0AEC0/FFFFFF',
  },
  {
    id: 'user-4',
    name: 'Charlie',
    email: 'charlie@example.com',
    avatarUrl: 'https://placehold.co/100x100/F56565/FFFFFF',
  },
];
