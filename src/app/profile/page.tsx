
"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BotMessageSquare, Upload, User, Mail, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateUserProfile } from "@/services/auth"; // We will create this function

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else {
        setName(user.displayName || "");
        setPhotoPreview(user.photoURL || null);
      }
    }
  }, [user, loading, router]);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Username is required" });
      return;
    }
    setIsLoading(true);
    try {
      await updateUserProfile(user, name, photo);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      // Optionally refresh the page or user state if needed
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (loading || !user) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-background">
          <Card className="w-full max-w-md animate-pulse">
            <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-3 mb-4">
                 <BotMessageSquare className="w-8 h-8 text-primary" />
                 <h1 className="text-2xl font-bold tracking-tight">SilentLine</h1>
              </div>
              <CardTitle className="text-2xl">Edit Profile</CardTitle>
              <CardDescription>Update your account details.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                <div className="space-y-2 flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-2 bg-muted"></Avatar>
                    <div className="h-8 w-28 bg-muted rounded-md" />
                </div>
                <div className="space-y-2">
                    <div className="h-5 w-20 bg-muted rounded-md" />
                    <div className="h-10 w-full bg-muted rounded-md" />
                </div>
                <div className="space-y-2">
                   <div className="h-5 w-20 bg-muted rounded-md" />
                    <div className="h-10 w-full bg-muted rounded-md" />
                </div>
                <div className="h-10 w-full bg-muted rounded-md mt-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
             <BotMessageSquare className="w-8 h-8 text-primary" />
             <h1 className="text-2xl font-bold tracking-tight">SilentLine</h1>
          </div>
          <CardTitle className="text-2xl">Edit Profile</CardTitle>
          <CardDescription>Update your account details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2 flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-2">
                    <AvatarImage src={photoPreview || undefined} alt="Avatar Preview" />
                    <AvatarFallback><User className="w-8 h-8 text-muted-foreground"/></AvatarFallback>
                </Avatar>
                <Input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden"/>
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('photo-upload')?.click()} disabled={isLoading}>
                    <Upload className="mr-2 h-4 w-4" />
                    Change Photo
                </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Username</Label>
              <div className="relative">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving Changes..." : "Save Changes"}
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            <Button variant="link" onClick={() => router.push('/chat')}>Back to Chat</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
