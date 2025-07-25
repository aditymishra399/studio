
"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Fingerprint, Upload, User, Mail, ShieldCheck, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateUserProfile } from "@/services/auth";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
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
  
  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

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
      // Force a reload of the user data within the auth context
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
          <Card className="w-full max-w-md animate-pulse m-4">
            <CardHeader className="text-center">
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
             <CardFooter className="flex-col gap-4">
               <div className="h-10 w-full bg-muted rounded-md" />
               <div className="h-10 w-full bg-muted rounded-md" />
            </CardFooter>
          </Card>
        </div>
      )
  }

  return (
    <div className="flex items-center justify-center min-h-full bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
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
        </CardContent>
        <CardFooter className="flex-col gap-2">
             <Button variant="outline" className="w-full" onClick={handleSignOut} disabled={isLoading}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
