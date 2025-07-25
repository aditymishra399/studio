"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, SendHorizonal } from "lucide-react";
import { runRedactContent } from "@/app/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = React.useState("");
  const [isRedacting, setIsRedacting] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [redactionResult, setRedactionResult] = React.useState<{
    redactedContent: string;
    sensitiveTerms: string[];
  } | null>(null);
  const { toast } = useToast();

  const handleRedactClick = React.useCallback(async () => {
    if (!message.trim()) return;

    setIsRedacting(true);
    try {
      const result = await runRedactContent(message);
      if (result && result.sensitiveTerms.length > 0) {
        setRedactionResult(result);
      } else {
        toast({
          title: "No sensitive content found",
          description: "Your message seems clear.",
        });
      }
    } catch (error) {
      console.error("Redaction failed:", error);
      toast({
        variant: "destructive",
        title: "Redaction failed",
        description: "Could not process your message for redaction.",
      });
    } finally {
      setIsRedacting(false);
    }
  }, [message, toast]);

  const handleConfirmRedaction = React.useCallback(() => {
    if (redactionResult) {
      setMessage(redactionResult.redactedContent);
      setRedactionResult(null);
    }
  }, [redactionResult]);

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isSending) {
      setIsSending(true);
      try {
        await onSendMessage(message);
      } finally {
        setIsSending(false);
      }
      setMessage("");
    }
  }, [message, onSendMessage, isSending]);

  return (
    <div className="p-4 border-t bg-card">
      <form onSubmit={handleSubmit} className="relative">
        <Textarea
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={1}
          className="pr-32 py-3 resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
            }
          }}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
          <AlertDialog
            open={!!redactionResult}
            onOpenChange={(open) => !open && setRedactionResult(null)}
          >
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRedactClick}
                disabled={isRedacting || !message.trim()}
                title="Check for sensitive content"
              >
                <AlertTriangle className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sensitive Content Found</AlertDialogTitle>
                <AlertDialogDescription>
                  We found the following sensitive terms in your message:{" "}
                  <strong>{redactionResult?.sensitiveTerms.join(", ")}</strong>.
                  <br />
                  Do you want to redact them?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="p-4 border rounded-md bg-muted text-sm">
                <p className="font-semibold">Original:</p>
                <p className="text-muted-foreground">{message}</p>
                <p className="font-semibold mt-2">Redacted:</p>
                <p className="text-muted-foreground">
                  {redactionResult?.redactedContent}
                </p>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmRedaction}>
                  Yes, Redact
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button type="submit" size="icon" disabled={!message.trim()}>
            <SendHorizonal className="w-5 h-5" />
      <Button type="submit" size="icon" disabled={!message.trim() || isSending}>
        </div>
      </form>
    </div>
  );
}
