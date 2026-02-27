import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  arrayUnion,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { userService } from './userService';
import { Room, CreateRoomData, RoomError } from '../types/room.types';

const ROOMS_COLLECTION = 'rooms';
const USERS_COLLECTION = 'users';

class RoomService {
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private async isInviteCodeUnique(code: string): Promise<boolean> {
    const roomsRef = collection(db, ROOMS_COLLECTION);
    const q = query(roomsRef, where('inviteCode', '==', code));
    const snapshot = await getDocs(q);
    return snapshot.empty;
  }

  private async generateUniqueInviteCode(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const code = this.generateInviteCode();
      if (await this.isInviteCodeUnique(code)) {
        return code;
      }
      attempts++;
    }
    
    throw new Error('Failed to generate unique invite code');
  }

  async createRoom(userId: string): Promise<Room> {
    try {
      // Check if user already has a room
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
      const userData = userDoc.data();
      
      if (userData?.roomId) {
        throw new Error('User already belongs to a room');
      }

      const inviteCode = await this.generateUniqueInviteCode();
      const roomId = doc(collection(db, ROOMS_COLLECTION)).id;
      
      const roomData = {
        createdBy: userId,
        members: [userId],
        inviteCode,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, ROOMS_COLLECTION, roomId), roomData);
      await userService.updateUserRoom(userId, roomId);

      return {
        id: roomId,
        ...roomData,
        createdAt: new Date()
      } as Room;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  async joinRoom(inviteCode: string, userId: string): Promise<Room> {
    try {
      // Check if user already has a room
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
      const userData = userDoc.data();
      
      if (userData?.roomId) {
        throw new Error('User already belongs to a room');
      }

      // Find room by invite code
      const roomsRef = collection(db, ROOMS_COLLECTION);
      const q = query(roomsRef, where('inviteCode', '==', inviteCode));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error('Invalid invite code');
      }

      const roomDoc = snapshot.docs[0];
      const roomData = roomDoc.data();

      // Update room members
      await updateDoc(doc(db, ROOMS_COLLECTION, roomDoc.id), {
        members: arrayUnion(userId)
      });

      // Update user's roomId
      await userService.updateUserRoom(userId, roomDoc.id);

      return {
        id: roomDoc.id,
        ...roomData,
        createdAt: roomData.createdAt?.toDate()
      } as Room;
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  }

  async getRoom(roomId: string): Promise<Room | null> {
    try {
      const roomDoc = await getDoc(doc(db, ROOMS_COLLECTION, roomId));
      
      if (!roomDoc.exists()) {
        return null;
      }

      const data = roomDoc.data();
      return {
        id: roomDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate()
      } as Room;
    } catch (error) {
      console.error('Error getting room:', error);
      throw error;
    }
  }

  listenToRoom(roomId: string, callback: (room: Room | null) => void): Unsubscribe {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    
    return onSnapshot(roomRef, 
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          callback({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate()
          } as Room);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Room listener error:', error);
        callback(null);
      }
    );
  }

  async leaveRoom(userId: string, roomId: string): Promise<void> {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, roomId);
      const roomDoc = await getDoc(roomRef);
      
      if (!roomDoc.exists()) {
        throw new Error('Room not found');
      }

      const roomData = roomDoc.data();
      
      // Remove user from members array
      const updatedMembers = roomData.members.filter((id: string) => id !== userId);
      
      if (updatedMembers.length === 0) {
        // Delete room if no members left
        await roomRef.delete();
      } else {
        // Update room with remaining members
        await updateDoc(roomRef, {
          members: updatedMembers
        });
      }

      // Remove roomId from user
      await userService.updateUserRoom(userId, null);
    } catch (error) {
      console.error('Error leaving room:', error);
      throw error;
    }
  }

  async validateRoomAccess(roomId: string, userId: string): Promise<boolean> {
    try {
      const roomDoc = await getDoc(doc(db, ROOMS_COLLECTION, roomId));
      
      if (!roomDoc.exists()) {
        return false;
      }

      const roomData = roomDoc.data();
      return roomData.members?.includes(userId) || false;
    } catch (error) {
      console.error('Error validating room access:', error);
      return false;
    }
  }
}

export const roomService = new RoomService();
