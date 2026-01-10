// src/screens/AdminScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { adminAPI, categoriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminScreen = ({ navigation }) => {
  const { user, isAdmin } = useAuth();
  const [warnings, setWarnings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingWarning, setEditingWarning] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    warningSigns: '',
    categoryId: 1,
    status: 'Approved',
  });

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You need admin privileges to access this page');
      navigation.goBack();
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchWarnings(), fetchCategories()]);
    setLoading(false);
  };

  const fetchWarnings = async () => {
    const result = await adminAPI.getAllWarnings(user.id);
    if (result.success) {
      setWarnings(result.data);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const fetchCategories = async () => {
    const result = await categoriesAPI.getAll();
    if (result.success) {
      setCategories(result.data);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWarnings();
    setRefreshing(false);
  }, []);

  const handleDeleteWarning = (warningId, title) => {
    Alert.alert(
      'Delete Warning',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await adminAPI.deleteWarning(warningId, user.id);
            if (result.success) {
              Alert.alert('Success', 'Warning deleted successfully');
              fetchWarnings();
            } else {
              Alert.alert('Error', result.error);
            }
          },
        },
      ]
    );
  };

  const handleEditWarning = (warning) => {
    setEditingWarning(warning);
    setEditForm({
      title: warning.title,
      description: warning.description,
      warningSigns: warning.warningSigns,
      categoryId: categories.find(c => c.name === warning.categoryName)?.id || 1,
      status: warning.status,
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.title.trim() || editForm.title.length < 5) {
      Alert.alert('Error', 'Title must be at least 5 characters');
      return;
    }
    if (!editForm.description.trim() || editForm.description.length < 20) {
      Alert.alert('Error', 'Description must be at least 20 characters');
      return;
    }
    if (!editForm.warningSigns.trim() || editForm.warningSigns.length < 10) {
      Alert.alert('Error', 'Warning signs must be at least 10 characters');
      return;
    }

    const result = await adminAPI.updateWarning(editingWarning.id, editForm, user.id);
    if (result.success) {
      Alert.alert('Success', 'Warning updated successfully');
      setEditModalVisible(false);
      fetchWarnings();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleApprove = async (warningId) => {
    const result = await adminAPI.approveWarning(warningId, user.id);
    if (result.success) {
      Alert.alert('Success', 'Warning approved');
      fetchWarnings();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return '#4CAF50';
      case 'Pending':
        return '#FF9800';
      default:
        return '#999';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading admin panel...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🛡️ Admin Panel</Text>
          <Text style={styles.headerSubtitle}>Manage warnings and comments</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{warnings.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
              {warnings.filter(w => w.status === 'Approved').length}
            </Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#FF9800' }]}>
              {warnings.filter(w => w.status === 'Pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Warnings List */}
        <Text style={styles.sectionTitle}>All Warnings</Text>
        {warnings.map((warning) => (
          <View key={warning.id} style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <Text style={styles.warningTitle} numberOfLines={1}>
                {warning.title}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(warning.status) }]}>
                <Text style={styles.statusText}>{warning.status}</Text>
              </View>
            </View>
            
            <Text style={styles.warningMeta}>
              By {warning.authorUsername} • {warning.categoryName}
            </Text>
            <Text style={styles.warningDescription} numberOfLines={2}>
              {warning.description}
            </Text>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.editBtn]}
                onPress={() => handleEditWarning(warning)}
              >
                <Text style={styles.actionBtnText}>✏️ Edit</Text>
              </TouchableOpacity>

              {warning.status !== 'Approved' && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={() => handleApprove(warning.id)}
                >
                  <Text style={styles.actionBtnText}>✓ Approve</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={() => handleDeleteWarning(warning.id, warning.title)}
              >
                <Text style={styles.actionBtnText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {warnings.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No warnings found</Text>
          </View>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Warning</Text>

            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.input}
              value={editForm.title}
              onChangeText={(text) => setEditForm({ ...editForm, title: text })}
              placeholder="Title"
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editForm.description}
              onChangeText={(text) => setEditForm({ ...editForm, description: text })}
              placeholder="Description"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.inputLabel}>Warning Signs</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editForm.warningSigns}
              onChangeText={(text) => setEditForm({ ...editForm, warningSigns: text })}
              placeholder="Warning Signs"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Status</Text>
            <View style={styles.statusPicker}>
              {['Approved', 'Pending'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    editForm.status === status && styles.statusOptionActive,
                    { borderColor: getStatusColor(status) }
                  ]}
                  onPress={() => setEditForm({ ...editForm, status })}
                >
                  <Text style={[
                    styles.statusOptionText,
                    editForm.status === status && { color: getStatusColor(status) }
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  warningCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  warningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  warningMeta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  warningDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  editBtn: {
    backgroundColor: '#007AFF',
  },
  approveBtn: {
    backgroundColor: '#4CAF50',
  },
  rejectBtn: {
    backgroundColor: '#FF9800',
  },
  deleteBtn: {
    backgroundColor: '#F44336',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  statusPicker: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  statusOptionActive: {
    backgroundColor: '#f0f0f0',
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f0f0f0',
  },
  cancelBtnText: {
    color: '#666',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#007AFF',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AdminScreen;
