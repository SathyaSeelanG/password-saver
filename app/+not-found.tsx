import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Home } from 'lucide-react-native';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.message}>The page you're looking for doesn't exist.</Text>
      
      <TouchableOpacity 
        style={styles.homeButton}
        onPress={() => router.replace('/')}
      >
        <Home size={20} color="#FFFFFF" />
        <Text style={styles.homeButtonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5F7FA',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1F2937',
    marginBottom: 8,
  },
  message: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  homeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
