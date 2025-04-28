import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList, Platform, ActivityIndicator, Clipboard, Alert } from 'react-native';
import { Search, Eye, EyeOff, Copy, Settings, Download, CirclePlus as PlusCircle, Edit, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Link, useRouter, Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { usePasswords } from '@/hooks/usePasswords';
import EmptyState from '@/components/EmptyState';
import ExportModal from '../components/ExportModal';
import { Password } from '@/types';

const PasswordItem = ({ item, onEdit, onDelete }: { item: Password; onEdit: (id: string) => void; onDelete: (id: string) => void }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();

  const copyToClipboard = async (text: string) => {
    if (Platform.OS === 'web') {
      await navigator.clipboard.writeText(text);
    } else {
      await Clipboard.setString(text);
    }
    Platform.OS !== 'web' && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <BlurView intensity={20} style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>{item.appName.charAt(0).toUpperCase()}</Text>
        </BlurView>
        <View style={styles.cardHeaderText}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.appName}</Text>
            <TouchableOpacity onPress={() => copyToClipboard(item.appName)} style={styles.copyButton}>
              <Copy size={14} color="#6366F1" />
            </TouchableOpacity>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.cardSubtitle} numberOfLines={1}>{item.emailOrPhone}</Text>
            <TouchableOpacity onPress={() => copyToClipboard(item.emailOrPhone)} style={styles.copyButton}>
              <Copy size={14} color="#6366F1" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.passwordRow}>
        <Text style={styles.passwordText} numberOfLines={1}>
          {isPasswordVisible ? item.password : '••••••••••'}
        </Text>
        <View style={styles.passwordActions}>
          <TouchableOpacity onPress={() => copyToClipboard(item.password)} style={styles.actionButton}>
            <Copy size={14} color="#6366F1" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.actionButton}
          >
            {isPasswordVisible ? (
              <EyeOff size={14} color="#6366F1" />
            ) : (
              <Eye size={14} color="#6366F1" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => onEdit(item.id)}
        >
          <Edit size={14} color="#6366F1" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => onDelete(item.id)}
        >
          <Trash2 size={14} color="#DC2626" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function IndexPage() {
  const { isAuthenticated, isInitialized } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const { passwords, deletePassword } = usePasswords();
  const [filteredPasswords, setFilteredPasswords] = useState<Password[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPasswords(passwords);
    } else {
      const filtered = passwords.filter(
        (pw) =>
          pw.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pw.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pw.emailOrPhone.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPasswords(filtered);
    }
  }, [searchQuery, passwords]);

  const handleEditPassword = (id: string) => {
    router.push(`/password/${id}`);
  };

  const handleDeletePassword = (id: string) => {
    Alert.alert(
      'Delete Password',
      'Are you sure you want to delete this password?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Platform.OS !== 'web' && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deletePassword(id);
          },
        },
      ]
    );
  };

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Passwords</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => setShowExportModal(true)}
            style={styles.headerButton}
          >
            <Download size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Link href="/settings" asChild>
            <TouchableOpacity style={styles.headerButton}>
              <Settings size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={18} color="#6366F1" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search passwords..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
          clearButtonMode="while-editing"
        />
      </View>

      {passwords.length === 0 ? (
        <EmptyState message="No passwords saved yet" />
      ) : (
        <FlatList
          data={filteredPasswords}
          renderItem={({ item }) => (
            <PasswordItem 
              item={item} 
              onEdit={handleEditPassword}
              onDelete={handleDeletePassword}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Link href="/password/new" asChild>
        <TouchableOpacity style={styles.fab}>
          <PlusCircle size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Link>

      <ExportModal 
        visible={showExportModal} 
        onClose={() => setShowExportModal(false)} 
        passwords={passwords}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#6366F1',
    padding: 16,
    paddingTop: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 16,
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1F2937',
    paddingVertical: 4,
  },
  listContainer: {
    padding: 12,
    paddingTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#6366F1',
  },
  cardHeaderText: {
    flex: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#1F2937',
    maxWidth: '85%',
  },
  cardSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
    maxWidth: '85%',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  passwordText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
  },
  passwordActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 6,
    marginLeft: 4,
  },
  copyButton: {
    padding: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    marginRight: 10,
  },
  editButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#6366F1',
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  deleteButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#DC2626',
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    bottom: 24,
    right: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});