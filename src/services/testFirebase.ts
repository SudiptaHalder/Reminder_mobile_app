import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export const testWrite = async () => {
  try {
    const docRef = await addDoc(collection(db, "debug"), {
      message: "Firebase Connected 🚀",
      createdAt: new Date(),
    });
    console.log("Document written with ID:", docRef.id);
  } catch (error) {
    console.error("Error writing document:", error);
  }
};
