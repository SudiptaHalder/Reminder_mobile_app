import React, { useEffect } from "react";
import RootNavigator from "../navigation/RootNavigator";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { useAuthStore } from "../store/authStore";

export default function AppEntry() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return unsubscribe;
  }, []);

  return <RootNavigator />;
}
