// src/screens/AddWarningScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { warningsAPI, categoriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AddWarningScreen = ({ navigation }) => {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [warningSigns, setWarningSigns] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoadingCategories(true);
    
    const result = await categoriesAPI.getAll();
    
    if (result.success) {
      setCategories(result.data);
    } else {
      Alert.alert('Error', 'Failed to load categories: ' + result.error);
      // Fallback categories
      setCategories([
        { id: 1, name: 'Phone' },
        { id: 2, name: 'Email' },
        { id: 3, name: 'Online' },
        { id: 4, name: 'Investment' },
        { id: 5, name: 'Social Media' },
        { id: 6, name: 'Other' },
      ]);
    }
    
    setLoadingCategories(false);
  };

  const handleSubmit = async () => {
    // Check if user is logged in
    if (!isLoggedIn || !user) {
      Alert.alert('Error', 'Please login first');
      navigation.navigate('Auth');
      return;
    }

    // Basic validation matching backend requirements
    if (!title.trim() || title.trim().length < 5) {
      Alert.alert('Error', 'Title must be at least 5 characters');
      return;
    }
    if (!description.trim() || description.trim().length < 20) {
      Alert.alert('Error', 'Description must be at least 20 characters');
      return;
    }
    if (!warningSigns.trim() || warningSigns.trim().length < 5) {
      Alert.alert('Error', 'Warning signs must be at least 5 characters');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setLoading(true);
    
    const result = await warningsAPI.create(
      title.trim(),
      description.trim(),
      warningSigns.trim(),
      selectedCategory,
      user.id // Pass userId from context
    );
    
    setLoading(false);
    
    if (result.success) {
      Alert.alert(
        'Success!',
        'Your warning has been submitted successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form
              setTitle('');
              setDescription('');
              setWarningSigns('');
              setSelectedCategory(null);
              
              // Navigate back to home
              navigation.navigate('Home');
            }
          }
        ]
      );
    } else {
      Alert.alert('Submission Failed', result.error);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Warning?',
      'Are you sure you want to discard this warning?',
      [
        { text: 'Continue Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  // Show loading screen while checking auth status
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show login required message if not authenticated
  if (!isLoggedIn) {
    return (
      <View style={styles.authRequiredContainer}>
        <Text style={styles.authRequiredIcon}>🔒</Text>
        <Text style={styles.authRequiredTitle}>Login Required</Text>
        <Text style={styles.authRequiredText}>
          Please log in to report a scam
        </Text>
        <TouchableOpacity
          style={styles.authRequiredButton}
          onPress={() => navigation.navigate('Auth')}
        >
          <Text style={styles.authRequiredButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show loading screen while categories are being fetched
  if (loadingCategories) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Report a Scam Warning</Text>
          <Text style={styles.headerSubtitle}>
            Help protect others by sharing scam information
          </Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          
          {/* Title Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Phone Call Scam Alert"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              editable={!loading}
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>

          {/* Description Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Provide detailed information about the scam, including how it works and who it targets..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
              editable={!loading}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>

          {/* Warning Signs Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Warning Signs *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="List the warning signs to look out for (e.g., urgent demands, suspicious links, requests for personal info)..."
              value={warningSigns}
              onChangeText={setWarningSigns}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={1000}
              editable={!loading}
            />
            <Text style={styles.charCount}>{warningSigns.length}/1000</Text>
          </View>

          {/* Category Selection */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === category.id && styles.categoryButtonTextActive
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Your submission will be reviewed before being published to ensure accuracy and relevance.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Warning</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  fieldHint: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonDisabled: {
    opacity: 0.6,
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
  authRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  authRequiredIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  authRequiredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  authRequiredText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  authRequiredButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 8,
  },
  authRequiredButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddWarningScreen;
