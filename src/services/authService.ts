import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { createUserProfile } from "./userService";

export const register = async (email: string, password: string) => {
  console.log("REGISTER CALLED");

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  console.log("USER CREATED:", user.uid);

  await createUserProfile(user.uid, user.email || "");

  console.log("PROFILE CREATION ATTEMPTED");

  return userCredential;
};

export const login = (email: string, password: string) => {
  console.log("LOGIN CALLED");
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
  return signOut(auth);
};
