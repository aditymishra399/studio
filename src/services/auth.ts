
import { auth, storage } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword as firebaseSignIn, 
  createUserWithEmailAndPassword as firebaseSignUp,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { createUserProfile } from "./firestore";

export async function signInWithEmailAndPassword(email: string, password: string): Promise<void> {
  try {
    await firebaseSignIn(auth, email, password);
  } catch (error: any) {
    console.error("Error signing in:", error);
    throw new Error(error.message || "Failed to sign in.");
  }
}

export async function createUserWithEmailAndPassword(email: string, password: string, name: string, photo: File | null): Promise<void> {
  try {
    const userCredential = await firebaseSignUp(auth, email, password);
    const user = userCredential.user;

    let photoURL = `https://placehold.co/100x100/947EC5/FFFFFF`; // default avatar

    if (photo) {
      const storageRef = ref(storage, `avatars/${user.uid}/${photo.name}`);
      const snapshot = await uploadBytes(storageRef, photo);
      photoURL = await getDownloadURL(snapshot.ref);
    }

    await updateProfile(user, {
      displayName: name,
      photoURL: photoURL
    });

    await createUserProfile(user.uid, name, email, photoURL);

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

export async function sendPasswordResetEmail(email: string): Promise<void> {
    try {
        await firebaseSendPasswordResetEmail(auth, email);
    } catch (error: any) {
        console.error("Error sending password reset email:", error);
        throw new Error(error.message || "Failed to send password reset email.");
    }
}
