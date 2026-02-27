import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuthStore } from '../store/auth.store';
import RootNavigator from '../navigation/RootNavigator';

console.log('🟢 AppEntry.tsx - Module loaded');

export default function AppEntry() {
  console.log('🟢 AppEntry.tsx - Component executing');
  const { setUser, setIsLoading } = useAuthStore();

  useEffect(() => {
    console.log('🟢 AppEntry.tsx - useEffect running');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🟢 AppEntry.tsx - Auth state changed:', user?.email || 'No user');
      setUser(user);
      setIsLoading(false);
    });

    return () => {
      console.log('🟢 AppEntry.tsx - Cleanup');
      unsubscribe();
    };
  }, []);

  console.log('🟢 AppEntry.tsx - Rendering RootNavigator');
  return <RootNavigator />;
}
