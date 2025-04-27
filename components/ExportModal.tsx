import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { FileText, FileSpreadsheet, Table, X } from 'lucide-react-native';
import { Password } from '@/types';
import { exportPdf, exportExcel, exportCsv } from '@/utils/exportUtils';

type ExportModalProps = {
  visible: boolean;
  onClose: () => void;
  passwords: Password[];
};

export default function ExportModal({ visible, onClose, passwords }: ExportModalProps) {
  const handleExport = async (type: 'pdf' | 'excel' | 'csv') => {
    try {
      let fileContent;
      let fileName;
      
      switch (type) {
        case 'pdf':
          fileContent = await exportPdf(passwords);
          fileName = 'passwords.pdf';
          break;
        case 'excel':
          fileContent = await exportExcel(passwords);
          fileName = 'passwords.xlsx';
          break;
        case 'csv':
          fileContent = await exportCsv(passwords);
          fileName = 'passwords.csv';
          break;
      }

      if (Platform.OS === 'web') {
        const url = URL.createObjectURL(fileContent instanceof Blob ? fileContent : new Blob([fileContent]));
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      onClose();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Export Passwords</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.exportOption}
            onPress={() => handleExport('pdf')}
          >
            <FileText size={24} color="#DC2626" />
            <View style={styles.exportOptionText}>
              <Text style={styles.exportOptionTitle}>PDF Format</Text>
              <Text style={styles.exportOptionDescription}>
                Export as a readable PDF document
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exportOption}
            onPress={() => handleExport('excel')}
          >
            <FileSpreadsheet size={24} color="#107C41" />
            <View style={styles.exportOptionText}>
              <Text style={styles.exportOptionTitle}>Excel Format</Text>
              <Text style={styles.exportOptionDescription}>
                Export as an Excel spreadsheet
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exportOption}
            onPress={() => handleExport('csv')}
          >
            <Table size={24} color="#3B82F6" />
            <View style={styles.exportOptionText}>
              <Text style={styles.exportOptionTitle}>CSV Format</Text>
              <Text style={styles.exportOptionDescription}>
                Export as a CSV file
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  exportOptionText: {
    marginLeft: 16,
    flex: 1,
  },
  exportOptionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  exportOptionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
});