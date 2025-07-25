
import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Video, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatHeaderProps {
  user: User | undefined;
}

export default function ChatHeader({ user }: ChatHeaderProps) {
  const router = useRouter();

  if (!user) return null;

  return (
    <div className="flex items-center justify-between p-4 border-b bg-card sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push('/chat')}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <Avatar>
          <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person face" />
          <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold">{user.name}</h2>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Phone className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Video className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
