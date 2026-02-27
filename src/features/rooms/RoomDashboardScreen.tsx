import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/auth.store';
import { roomService } from '../../services/roomService';
import { userService } from '../../services/userService';
import { Room } from '../../types/room.types';

interface RouteParams {
  roomId: string;
}

export default function RoomDashboardScreen() {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { roomId } = route.params as RouteParams;

  useEffect(() => {
    const unsubscribe = roomService.listenToRoom(roomId, async (updatedRoom) => {
      setRoom(updatedRoom);
      
      if (updatedRoom?.members) {
        // Fetch member details
        const memberPromises = updatedRoom.members.map(async (uid) => {
          return userService.getUserProfile(uid);
        });
        
        const memberResults = await Promise.all(memberPromises);
        setMembers(memberResults.filter(m => m !== null));
      }
      
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  const handleShareInvite = async () => {
    if (!room) return;
    
    try {
      await Share.share({
        message: `Join my Shared Reminders room using invite code: ${room.inviteCode}`,
        title: 'Room Invite Code',
      });
    } catch (error) {
      console.error('Error sharing invite:', error);
    }
  };

  const handleLeaveRoom = () => {
    Alert.alert(
      'Leave Room',
      'Are you sure you want to leave this room? You can only rejoin with an invite code.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user || !room) return;
              await roomService.leaveRoom(user.uid, room.id);
              navigation.reset({
                index: 0,
                routes: [{ name: 'RoomSetup' }],
              });
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to leave room');
            }
          },
        },
      ]
    );
  };

  const handleCopyInviteCode = () => {
    Alert.alert('Copied!', 'Invite code copied to clipboard');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Room not found</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} />
        }
      >
        {/* Room Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.roomTitle}>Your Room</Text>
            <TouchableOpacity onPress={handleLeaveRoom}>
              <Text style={styles.leaveText}>Leave</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Invite Code Card */}
        <View style={styles.inviteCard}>
          <Text style={styles.inviteLabel}>Invite Code</Text>
          <View style={styles.inviteCodeContainer}>
            <Text style={styles.inviteCode}>{room.inviteCode}</Text>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={handleCopyInviteCode}
            >
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShareInvite}
          >
            <Text style={styles.shareButtonText}>Share Invite Code</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{room.members.length}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Active Tasks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {new Date(room.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.statLabel}>Created</Text>
          </View>
        </View>

        {/* Members Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Members</Text>
          {members.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>
                  {member.email?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberEmail}>{member.email}</Text>
                <Text style={styles.memberBadge}>
                  {member.id === room.createdBy ? '👑 Creator' : '👤 Member'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Tasks Section (Placeholder) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Tasks</Text>
          <View style={styles.emptyTasks}>
            <Text style={styles.emptyTasksEmoji}>📝</Text>
            <Text style={styles.emptyTasksTitle}>No tasks yet</Text>
            <Text style={styles.emptyTasksText}>
              Create your first task to get started
            </Text>
          </View>
        </View>

        {/* Create Task Button */}
        <TouchableOpacity 
          style={styles.createTaskButton}
          onPress={() => navigation.navigate('CreateTask', { roomId: room.id })}
        >
          <Text style={styles.createTaskButtonText}>+ Create New Task</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  leaveText: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: '500',
  },
  inviteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  inviteLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  inviteCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  inviteCode: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    letterSpacing: 2,
  },
  copyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
  },
  copyButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberEmail: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 2,
  },
  memberBadge: {
    fontSize: 12,
    color: '#666',
  },
  emptyTasks: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  emptyTasksEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTasksTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  emptyTasksText: {
    fontSize: 14,
    color: '#666',
  },
  createTaskButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  createTaskButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
