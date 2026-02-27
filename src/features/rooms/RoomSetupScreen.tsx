import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/auth.store';
import { roomService } from '../../services/roomService';

type SetupMode = 'create' | 'join';

export default function RoomSetupScreen() {
  const [mode, setMode] = useState<SetupMode>('create');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigation = useNavigation();
  const { user } = useAuthStore();

  const handleCreateRoom = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const room = await roomService.createRoom(user.uid);
      navigation.navigate('RoomDashboard', { roomId: room.id });
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
      Alert.alert('Error', err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!user) return;
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const room = await roomService.joinRoom(inviteCode.trim().toUpperCase(), user.uid);
      navigation.navigate('RoomDashboard', { roomId: room.id });
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
      Alert.alert('Error', err.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Shared Reminders</Text>
          <Text style={styles.subtitle}>
            Create a new room or join an existing one to start sharing reminders with your partner
          </Text>
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, mode === 'create' && styles.toggleActive]}
            onPress={() => setMode('create')}
          >
            <Text style={[styles.toggleText, mode === 'create' && styles.toggleTextActive]}>
              Create Room
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, mode === 'join' && styles.toggleActive]}
            onPress={() => setMode('join')}
          >
            <Text style={[styles.toggleText, mode === 'join' && styles.toggleTextActive]}>
              Join Room
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'create' ? (
          <View style={styles.createContainer}>
            <View style={styles.createCard}>
              <Text style={styles.createEmoji}>🏠</Text>
              <Text style={styles.createTitle}>Create New Room</Text>
              <Text style={styles.createDescription}>
                You'll be the first member of this room. Share the invite code with your partner to let them join.
              </Text>
              
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.createButton, loading && styles.buttonDisabled]}
                onPress={handleCreateRoom}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Create Room</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.joinContainer}>
            <View style={styles.joinCard}>
              <Text style={styles.joinEmoji}>🔑</Text>
              <Text style={styles.joinTitle}>Join Existing Room</Text>
              <Text style={styles.joinDescription}>
                Enter the 8-character invite code provided by your partner
              </Text>

              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="Enter invite code (e.g., ABC123XY)"
                value={inviteCode}
                onChangeText={(text) => {
                  setInviteCode(text.toUpperCase());
                  setError(null);
                }}
                autoCapitalize="characters"
                maxLength={8}
                editable={!loading}
              />

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.joinButton, loading && styles.buttonDisabled]}
                onPress={handleJoinRoom}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.joinButtonText}>Join Room</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  createContainer: {
    flex: 1,
  },
  createCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  createEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  createTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  createDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  joinContainer: {
    flex: 1,
  },
  joinCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  joinEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  joinTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  joinDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    backgroundColor: '#f8f9fa',
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: 2,
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorContainer: {
    width: '100%',
    padding: 10,
    backgroundColor: '#fde8e8',
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    textAlign: 'center',
  },
  joinButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
