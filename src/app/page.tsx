import { Button } from "@/components/ui/button";
import { BotMessageSquare, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import AuthButton from "@/components/auth-button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 border-b">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BotMessageSquare className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">SilentLine</h1>
          </div>
          <nav className="flex items-center gap-4">
            <AuthButton />
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
              Secure & Private Messaging
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              We are all humans, if we don't protect our data then who else will? Let's chat together. And that too is safe.
            </p>
            <Link href="/chat">
              <Button size="lg">Start Secure Chat</Button>
            </Link>
          </div>
        </section>
        <section className="py-20 md:py-32 bg-card border-y">
          <div className="container mx-auto grid md:grid-cols-2 gap-12 text-center">
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Privacy First</h3>
              <p className="text-muted-foreground">
                Your conversations are scanned for sensitive data which you can
                redact with a single click.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Real-time redaction suggestions without slowing down your
                messaging experience.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="p-4 border-t">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SilentLine. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
