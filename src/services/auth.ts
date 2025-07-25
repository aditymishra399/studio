import { auth } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword as firebaseSignIn, 
  createUserWithEmailAndPassword as firebaseSignUp,
  signOut as firebaseSignOut
} from "firebase/auth";

export async function signInWithEmailAndPassword(email: string, password: string): Promise<void> {
  try {
    await firebaseSignIn(auth, email, password);
  } catch (error: any) {
    console.error("Error signing in:", error);
    throw new Error(error.message || "Failed to sign in.");
  }
}

export async function createUserWithEmailAndPassword(email: string, password: string): Promise<void> {
  try {
    await firebaseSignUp(auth, email, password);
  } catch (error: any) {
    console.error("Error signing up:", error);
    throw new Error(error.message || "Failed to sign up.");
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error("Error signing out:", error);
    throw new Error(error.message || "Failed to sign out.");
  }
}
