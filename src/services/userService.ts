import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export const createUserProfile = async (uid: string, email: string) => {
  console.log("CREATING PROFILE FOR:", uid);

  const userRef = doc(db, "users", uid);

  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      uid,
      email,
      createdAt: new Date(),
      roomId: null,
      fcmToken: null,
    });

    console.log("PROFILE CREATED SUCCESSFULLY");
  } else {
    console.log("PROFILE ALREADY EXISTS");
  }
};
