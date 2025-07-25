
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BotMessageSquare, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Name is required" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords do not match" });
      return;
    }
    setIsLoading(true);
    try {
      await signUp(email, password, name, photo);
      toast({
        title: "Account Created",
        description: "Your account has been successfully created. Please log in.",
      });
      router.push("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
             <BotMessageSquare className="w-8 h-8 text-primary" />
             <h1 className="text-2xl font-bold tracking-tight">SilentLine</h1>
          </div>
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Enter your details to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2 flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-2">
                    <AvatarImage src={photoPreview || undefined} alt="Avatar Preview" />
                    <AvatarFallback><Upload className="w-8 h-8 text-muted-foreground"/></AvatarFallback>
                </Avatar>
                <Input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden"/>
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('photo-upload')?.click()} disabled={isLoading}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
