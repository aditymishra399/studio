
import { auth, storage, db } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword as firebaseSignIn, 
  createUserWithEmailAndPassword as firebaseSignUp,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  User
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { createUserProfile, updateUserDocument, isUsernameTaken } from "./firestore";
import { collection, getDocs, query, where } from "firebase/firestore";

async function isEmailTaken(email: string): Promise<boolean> {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

export async function signInWithEmailAndPassword(email: string, password: string): Promise<void> {
  try {
    await firebaseSignIn(auth, email, password);
  } catch (error: any) {
    console.error("Error signing in:", error);
    throw new Error(error.message || "Failed to sign in.");
  }
}

export async function createUserWithEmailAndPassword(email: string, password: string, name: string, photo: File | null): Promise<void> {
  const allowedDomains = [
    "gmail.com",
    "hotmail.com",
    "protonmail.com",
    "outlook.com",
    "yahoo.com",
    "aol.com",
    "icloud.com"
  ];
  const emailDomain = email.split('@')[1];

  if (!emailDomain || !allowedDomains.includes(emailDomain.toLowerCase())) {
    throw new Error("Please use a valid email provider (e.g., Gmail, Outlook, etc.). Disposable email addresses are not allowed.");
  }

  const usernameExists = await isUsernameTaken(name);
  if (usernameExists) {
    throw new Error("Username is already taken. Please choose another one.");
  }
  
  const emailExists = await isEmailTaken(email);
  if (emailExists) {
    throw new Error("An account with this email already exists.");
  }


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
    // If the error is one of our custom ones, re-throw it. Otherwise, use the firebase error message.
    if (error.message.startsWith("Username is already taken") || error.message.startsWith("Please use a valid email provider") || error.message.startsWith("An account with this email")) {
        throw error;
    }
    throw new Error(error.message || "Failed to sign up.");
  }
}

export async function updateUserProfile(user: User, name: string, photo: File | null): Promise<void> {
    try {
        let photoURL = user.photoURL;

        if (photo) {
            const storageRef = ref(storage, `avatars/${user.uid}/${photo.name}`);
            const snapshot = await uploadBytes(storageRef, photo);
            photoURL = await getDownloadURL(snapshot.ref);
        }

        await updateProfile(user, {
            displayName: name,
            photoURL: photoURL,
        });
        
        await updateUserDocument(user.uid, {
            name,
            avatarUrl: photoURL,
        });

    } catch (error: any) {
        console.error("Error updating profile:", error);
        throw new Error(error.message || "Failed to update profile.");
    }
}


export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error: any)
  {
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
