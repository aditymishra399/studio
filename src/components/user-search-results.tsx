
"use client";

import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { memo } from "react";

interface UserSearchResultsProps {
  results: User[];
  onSelectUser: (user: User) => void;
}

const UserSearchResults = memo(function UserSearchResults({ results, onSelectUser }: UserSearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No users found.
      </div>
    );
  }

  return (
    <div className="p-2 space-y-1">
      {results.map((user) => (
        <button
          key={user.id}
          onClick={() => onSelectUser(user)}
          className="flex items-center w-full text-left gap-3 p-3 rounded-lg transition-colors hover:bg-muted"
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatarUrl} alt={user.name || ""} data-ai-hint="person avatar" />
            <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </button>
      ))}
    </div>
  );
});

export default UserSearchResults;
