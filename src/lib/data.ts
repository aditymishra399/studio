import type { User, Conversation } from './types';

export const users: User[] = [
  {
    id: 'user-1',
    name: 'You',
    avatarUrl: 'https://placehold.co/100x100/947EC5/FFFFFF',
  },
  {
    id: 'user-2',
    name: 'Alice',
    avatarUrl: 'https://placehold.co/100x100/6660B2/FFFFFF',
  },
  {
    id: 'user-3',
    name: 'Bob',
    avatarUrl: 'https://placehold.co/100x100/A0AEC0/FFFFFF',
  },
  {
    id: 'user-4',
    name: 'Charlie',
    avatarUrl: 'https://placehold.co/100x100/F56565/FFFFFF',
  },
];

export const conversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: [users[0], users[1]],
    messages: [
      {
        id: 'msg-1',
        sender: users[1],
        content: 'Hey! How are you?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
      {
        id: 'msg-2',
        sender: users[0],
        content: 'I am good, thanks! How about you?',
        timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
      },
       {
        id: 'msg-3',
        sender: users[1],
        content: 'Doing great! Just working on the new project.',
        timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      },
    ],
  },
  {
    id: 'conv-2',
    participants: [users[0], users[2]],
    messages: [
      {
        id: 'msg-4',
        sender: users[2],
        content: 'Can you send me the report?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: 'msg-5',
        sender: users[0],
        content: 'Sure, I will send it in a bit.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
      },
    ],
  },
  {
    id: 'conv-3',
    participants: [users[0], users[3]],
    messages: [
        {
            id: 'msg-6',
            sender: users[3],
            content: 'Lunch tomorrow?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        }
    ]
  }
];
