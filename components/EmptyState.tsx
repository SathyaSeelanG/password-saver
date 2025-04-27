import { StyleSheet, Text, View } from 'react-native';
import { ShieldAlert } from 'lucide-react-native';

type EmptyStateProps = {
  message: string;
};

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <ShieldAlert size={64} color="#9CA3AF" strokeWidth={1.5} />
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.subMessage}>
        Add some passwords to get started.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginVertical: 48,
  },
  message: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#4B5563',
    marginTop: 16,
    marginBottom: 8,
  },
  subMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});