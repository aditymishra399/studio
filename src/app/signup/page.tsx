
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Fingerprint, Upload, User, Mail, Lock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
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

  useEffect(() => {
    if (email.includes('@')) {
      const emailName = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      if (emailName) {
        setSuggestions([
          emailName,
          `${emailName}${Math.floor(Math.random() * 90) + 10}`,
          `${emailName}_dev`
        ]);
      } else {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  }, [email]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Username is required" });
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
             <Fingerprint className="w-8 h-8 text-primary" />
             <h1 className="text-2xl font-bold tracking-tight">SilentLine</h1>
          </div>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
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
              <Label htmlFor="email">Email</Label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
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
               {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-xs text-muted-foreground mr-2">Suggestions:</span>
                  {suggestions.map(s => (
                     <Badge 
                        key={s} 
                        variant="outline" 
                        className="cursor-pointer"
                        onClick={() => setName(s)}
                      >
                       {s}
                     </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Sign Up"}
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
