import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/auth.store';
import { userService } from '../services/userService';
import AuthScreen from '../features/auth/AuthScreen';
import RoomSetupScreen from '../features/rooms/RoomSetupScreen';
import RoomDashboardScreen from '../features/rooms/RoomDashboardScreen';
import { RootStackParamList } from '../types/navigation';

console.log('🔵 RootNavigator.tsx - Module loaded');

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  console.log('🔵 RootNavigator.tsx - Component executing');
  
  const { user, isLoading } = useAuthStore();
  const [hasRoom, setHasRoom] = React.useState<boolean | null>(null);
  const [checkingRoom, setCheckingRoom] = React.useState(true);

  console.log('🔵 RootNavigator.tsx - Auth state:', { 
    user: user?.email || 'null', 
    isLoading,
    hasRoom,
    checkingRoom 
  });

  useEffect(() => {
    console.log('🔵 RootNavigator.tsx - useEffect running');
    
    const checkUserRoom = async () => {
      if (user) {
        try {
          console.log('🔵 RootNavigator.tsx - Checking room for user:', user.uid);
          const userProfile = await userService.getUserProfile(user.uid);
          console.log('🔵 RootNavigator.tsx - User profile:', userProfile);
          setHasRoom(!!userProfile?.roomId);
        } catch (error) {
          console.error('🔵 RootNavigator.tsx - Error:', error);
          setHasRoom(false);
        } finally {
          setCheckingRoom(false);
        }
      } else {
        console.log('🔵 RootNavigator.tsx - No user, setting hasRoom null');
        setHasRoom(null);
        setCheckingRoom(false);
      }
    };

    checkUserRoom();
  }, [user]);

  // TEMPORARY: Show loading or debug view
  if (isLoading || checkingRoom) {
    console.log('🔵 RootNavigator.tsx - Loading state');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading... (isLoading: {String(isLoading)}, checkingRoom: {String(checkingRoom)})</Text>
      </View>
    );
  }

  console.log('🔵 RootNavigator.tsx - Rendering navigation with screen:', 
    !user ? 'Auth' : !hasRoom ? 'RoomSetup' : 'Dashboard');

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : !hasRoom ? (
          <Stack.Screen name="RoomSetup" component={RoomSetupScreen} />
        ) : (
          <>
            <Stack.Screen name="RoomDashboard" component={RoomDashboardScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
