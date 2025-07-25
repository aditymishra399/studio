
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
    // Provide more user-friendly error messages
    switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            throw new Error('Invalid email or password.');
        default:
            throw new Error('An unexpected error occurred during sign in.');
    }
  }
}

export async function createUserWithEmailAndPassword(email: string, password: string, name: string, photo: File | null): Promise<void> {
  // Basic validation, more can be added (e.g., password strength)
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
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
    
    // Update Firebase Auth profile
    await updateProfile(user, {
      displayName: name,
      photoURL: photoURL
    });

    // Create user document in Firestore
    await createUserProfile(user.uid, name, email, photoURL);

  } catch (error: any) {
    console.error("Error signing up:", error);
    // Re-throw custom errors, provide generic for others
    if (error.message.startsWith("Username is already taken") || error.message.startsWith("An account with this email")) {
        throw error;
    }
    throw new Error("Failed to create an account. Please try again.");
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

        // Update Firebase Auth profile first
        await updateProfile(user, {
            displayName: name,
            photoURL: photoURL,
        });
        
        // Then update the user document in Firestore
        await updateUserDocument(user.uid, {
            name,
            avatarUrl: photoURL,
        });

    } catch (error: any) {
        console.error("Error updating profile:", error);
        throw new Error("Failed to update profile.");
    }
}


export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error: any)
  {
    console.error("Error signing out:", error);
    throw new Error("Failed to sign out.");
  }
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
    try {
        await firebaseSendPasswordResetEmail(auth, email);
    } catch (error: any) {
        console.error("Error sending password reset email:", error);
         if (error.code === 'auth/user-not-found') {
            throw new Error("No account found with that email address.");
        }
        throw new Error("Failed to send password reset email.");
    }
}
