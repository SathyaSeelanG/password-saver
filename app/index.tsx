import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList, Platform, ActivityIndicator, Clipboard } from 'react-native';
import { Search, Eye, EyeOff, Copy, Settings, Download, CirclePlus as PlusCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Link, useRouter, Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { usePasswords } from '@/hooks/usePasswords';
import EmptyState from '@/components/EmptyState';
import ExportModal from '../components/ExportModal';
import { Password } from '@/types';

const PasswordItem = ({ item }: { item: Password }) => {
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
            <Text style={styles.cardTitle}>{item.appName}</Text>
            <TouchableOpacity onPress={() => copyToClipboard(item.appName)}>
              <Copy size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.cardSubtitle}>{item.emailOrPhone}</Text>
            <TouchableOpacity onPress={() => copyToClipboard(item.emailOrPhone)}>
              <Copy size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.passwordRow}>
        <Text style={styles.passwordText}>
          {isPasswordVisible ? item.password : '••••••••••'}
        </Text>
        <View style={styles.passwordActions}>
          <TouchableOpacity onPress={() => copyToClipboard(item.password)} style={styles.actionButton}>
            <Copy size={16} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.actionButton}
          >
            {isPasswordVisible ? (
              <EyeOff size={16} color="#6B7280" />
            ) : (
              <Eye size={16} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function IndexPage() {
  const { isAuthenticated, isInitialized } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const { passwords } = usePasswords();
  const [filteredPasswords, setFilteredPasswords] = useState<Password[]>([]);

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

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E40AF" />
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
            <Download size={24} color="#1E40AF" />
          </TouchableOpacity>
          <Link href="/settings" asChild>
            <TouchableOpacity style={styles.headerButton}>
              <Settings size={24} color="#1E40AF" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search passwords..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {passwords.length === 0 ? (
        <EmptyState message="No passwords saved yet" />
      ) : (
        <FlatList
          data={filteredPasswords}
          renderItem={({ item }) => <PasswordItem item={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Link href="/add" asChild>
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
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#1E40AF',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1F2937',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#1E40AF',
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
    fontSize: 16,
    color: '#1F2937',
  },
  cardSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
  },
  passwordText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#374151',
  },
  passwordActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});