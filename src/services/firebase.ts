import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, collection, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { OperationType } from '../types';

// Load config with fallback
const config = firebaseConfig as any;
const app = initializeApp(config);

// Try to initialize Firestore with the specified databaseId, fallback to default if it fails or is missing
let dbInstance;
try {
  if (config.firestoreDatabaseId && config.firestoreDatabaseId !== "(default)") {
    dbInstance = getFirestore(app, config.firestoreDatabaseId);
  } else {
    dbInstance = getFirestore(app);
  }
} catch (e) {
  console.warn("Falling back to default Firestore database", e);
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function testConnection() {
  try {
    // Attempt a light read to verify connection
    await getDocFromServer(doc(db, 'system', 'health'));
  } catch (error: any) {
    if (error.code === 'unavailable' || error.message?.includes('offline')) {
      console.warn("Firebase: System appearing offline or database unavailable. Check if Firestore is provisioned in your project.");
    } else if (error.code === 'permission-denied') {
      console.warn("Firebase: Connected but permission denied. Ensure security rules are deployed.");
    } else {
      console.error("Firebase connection error:", error);
    }
  }
}

testConnection();

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const signIn = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Sync user profile
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDocFromServer(userRef).catch(() => null);
    
    if (!userDoc || !userDoc.exists()) {
      await setDoc(userRef, {
        userId: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'user',
        createdAt: serverTimestamp()
      });
    }
    
    return user;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const signOutUser = () => auth.signOut();
