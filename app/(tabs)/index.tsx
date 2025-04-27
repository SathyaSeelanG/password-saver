import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Animated, Platform } from 'react-native';
import { Search, Eye, EyeOff, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { usePasswords } from '@/hooks/usePasswords';
import EmptyState from '@/components/EmptyState';
import { Password } from '@/types';

// Separate component for password item
const PasswordItem = ({ 
  item, 
  onEdit, 
  onDelete 
}: { 
  item: Password; 
  onEdit: (id: string) => void; 
  onDelete: (id: string) => void;
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
    Platform.OS !== 'web' && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.cardHeader}>
        <BlurView intensity={20} style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>
            {item.appName.charAt(0).toUpperCase()}
          </Text>
        </BlurView>
        <View style={styles.cardHeaderText}>
          <Text style={styles.cardTitle}>{item.appName}</Text>
          <Text style={styles.cardSubtitle}>{item.username}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Email/Phone:</Text>
          <Text style={styles.fieldValue}>{item.emailOrPhone}</Text>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Password:</Text>
          <View style={styles.passwordContainer}>
            <Text style={styles.fieldValue}>
              {isPasswordVisible ? item.password : '••••••••••'}
            </Text>
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.visibilityButton}
            >
              {isPasswordVisible ? (
                <EyeOff size={18} color="#6B7280" />
              ) : (
                <Eye size={18} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(item.id)}
        >
          <Edit size={16} color="#1E40AF" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(item.id)}
        >
          <Trash2 size={16} color="#DC2626" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default function PasswordsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPasswords, setFilteredPasswords] = useState<Password[]>([]);
  const { passwords, deletePassword } = usePasswords();
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

  const handleEdit = (id: string) => {
    router.push(`/password/${id}`);
  };

  const handleDelete = (id: string) => {
    Platform.OS !== 'web' && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deletePassword(id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
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
          renderItem={({ item }) => (
            <PasswordItem
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1F2937',
  },
  listContainer: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(219, 234, 254, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  cardBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1E40AF',
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  cardBody: {
    marginBottom: 16,
  },
  fieldRow: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  fieldValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1F2937',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  visibilityButton: {
    padding: 4,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    marginRight: 8,
  },
  actionButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#1E40AF',
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  deleteButtonText: {
    color: '#DC2626',
  },
});