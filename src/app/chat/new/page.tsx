
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import type { User } from "@/lib/types";
import { getAllUsers, findExistingConversation, createConversation } from "@/services/firestore";
import UserSearchResults from "@/components/user-search-results";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NewChatPage() {
  const { user: currentUser } = useAuth();
  const [allUsers, setAllUsers] = React.useState<User[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredUsers, setFilteredUsers] = React.useState<User[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!currentUser) return;
    
    const unsubscribeUsers = getAllUsers((users) => {
        const otherUsers = users.filter(u => u.id !== currentUser.uid);
        setAllUsers(otherUsers);
        setFilteredUsers(otherUsers);
    });

    return () => unsubscribeUsers();
  }, [currentUser]);

  const debouncedSearchTerm = React.useMemo(() => {
    const timeoutId = setTimeout(() => {
      return searchTerm;
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  React.useEffect(() => {
    const results = allUsers.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, allUsers]);

  const handleSelectUser = React.useCallback(async (selectedUser: User) => {
    if (!currentUser) {
        toast({ variant: "destructive", title: "You must be logged in." });
        return;
    }
    
    // Map the Auth user to a User type to pass to the backend functions
    const appUser: User = {
        id: currentUser.uid,
        name: currentUser.displayName,
        email: currentUser.email,
        avatarUrl: currentUser.photoURL || ''
    };

    try {
        const existingConversation = await findExistingConversation(appUser.id, selectedUser.id);
        
        if (existingConversation) {
            router.push(`/chat/${existingConversation.id}`);
        } else {
            const newConversation = await createConversation(appUser, selectedUser);
            router.push(`/chat/${newConversation.id}`);
        }
    } catch (error) {
        console.error("Error creating or finding conversation:", error);
        toast({ variant: "destructive", title: "Error starting chat." });
    }
  }, [currentUser, router, toast]);

  return (
    <div className="p-4">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <UserSearchResults results={filteredUsers} onSelectUser={handleSelectUser} />
    </div>
  );
}
