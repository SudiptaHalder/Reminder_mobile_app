import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from 'firebase/auth';

const USERS_COLLECTION = 'users';

class UserService {
  async createUserProfile(user: User): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          createdAt: serverTimestamp(),
          roomId: null,
          fcmToken: null,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null
        });
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async updateUserRoom(userId: string, roomId: string | null): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, { roomId });
    } catch (error) {
      console.error('Error updating user room:', error);
      throw error;
    }
  }

  async updateFCMToken(userId: string, token: string): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, { fcmToken: token });
    } catch (error) {
      console.error('Error updating FCM token:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
