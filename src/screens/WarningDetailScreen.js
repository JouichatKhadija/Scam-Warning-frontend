// src/screens/WarningDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { warningsAPI, commentsAPI, adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const WarningDetailScreen = ({ route, navigation }) => {
  const { warningId } = route.params;
  const { user, isLoggedIn, isAdmin } = useAuth();
  
  // State for API data
  const [warning, setWarning] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // State for comment form
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');

  // Fetch data on mount
  useEffect(() => {
    fetchWarningAndComments();
  }, []);

  // Fetch warning and comments from API
  const fetchWarningAndComments = async () => {
    setLoading(true);
    setError(null);
    
    // Fetch warning details
    const warningResult = await warningsAPI.getById(warningId);
    
    if (warningResult.success) {
      // Transform warningSigns from string to array if needed
      const warningData = warningResult.data;
      if (warningData.warningSigns && typeof warningData.warningSigns === 'string') {
        warningData.warningSigns = warningData.warningSigns.split(',').map(s => s.trim()).filter(s => s);
      }
      setWarning(warningData);
    } else {
      setError(warningResult.error);
      setLoading(false);
      return;
    }
    
    // Fetch comments
    const commentsResult = await commentsAPI.getByWarningId(warningId);
    
    if (commentsResult.success) {
      setComments(commentsResult.data);
    }
    
    setLoading(false);
  };

  // Handle comment submission
  const handleSubmitComment = async () => {
    // Check if user is logged in
    if (!isLoggedIn || !user) {
      Alert.alert('Error', 'Please login to add a comment');
      navigation.navigate('Auth');
      return;
    }

    // Validation
    if (!commentText.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    setSubmitting(true);
    
    const result = await commentsAPI.add(warningId, commentText.trim(), user.id);
    
    setSubmitting(false);
    
    if (result.success) {
      Alert.alert(
        'Success!',
        'Your comment has been submitted successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form and hide it
              setCommentText('');
              setShowCommentForm(false);
              // Refresh data
              fetchWarningAndComments();
            }
          }
        ]
      );
    } else {
      Alert.alert('Submission Failed', result.error);
    }
  };

  // Handle delete comment (admin only)
  const handleDeleteComment = (commentId) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await adminAPI.deleteComment(commentId, user.id);
            if (result.success) {
              Alert.alert('Success', 'Comment deleted');
              fetchWarningAndComments();
            } else {
              Alert.alert('Error', result.error);
            }
          },
        },
      ]
    );
  };

  // Handle cancel
  const handleCancelComment = () => {
    setCommentText('');
    setShowCommentForm(false);
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading warning details...</Text>
      </View>
    );
  }

  // Error state
  if (error || !warning) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>❌ {error || 'Warning not found'}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container}>
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{warning.categoryEmoji || '⚠️'} {warning.categoryName || warning.category}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{warning.title}</Text>

        {/* Date */}
        <Text style={styles.date}>Posted on {warning.datePosted}</Text>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{warning.description}</Text>
        </View>

        {/* Warning Signs Section */}
        {warning.warningSigns && warning.warningSigns.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Warning Signs</Text>
            {warning.warningSigns.map((sign, index) => (
              <View key={index} style={styles.warningSignItem}>
                <Text style={styles.bullet}>⚠️</Text>
                <Text style={styles.warningSignText}>{sign}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Report Button */}
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={() => navigation.navigate('AddWarning')}
        >
          <Text style={styles.reportButtonText}>🚨 Report Similar Scam</Text>
        </TouchableOpacity>

        {/* Comments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Comments ({comments.length})</Text>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentUsername}>{comment.username}</Text>
                <View style={styles.commentHeaderRight}>
                  <Text style={styles.commentTimestamp}>{new Date(comment.createdAt).toLocaleDateString()}</Text>
                  {isAdmin && (
                    <TouchableOpacity
                      style={styles.deleteCommentBtn}
                      onPress={() => handleDeleteComment(comment.id)}
                    >
                      <Text style={styles.deleteCommentText}>🗑️</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <Text style={styles.commentText}>{comment.text}</Text>
            </View>
          ))}
        </View>

        {/* Add Comment Button - Toggle Form */}
        {!showCommentForm ? (
          <TouchableOpacity 
            style={styles.addCommentButton}
            onPress={() => {
              if (!isLoggedIn) {
                Alert.alert('Login Required', 'Please login to add a comment', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Login', onPress: () => navigation.navigate('Auth') }
                ]);
              } else {
                setShowCommentForm(true);
              }
            }}
          >
            <Text style={styles.addCommentButtonText}>💬 Add Your Comment</Text>
          </TouchableOpacity>
        ) : (
          /* Comment Form */
          <View style={styles.commentFormContainer}>
            <Text style={styles.formTitle}>Add Your Comment</Text>
            <Text style={styles.commentingAs}>Commenting as: {user?.username || 'Unknown'}</Text>

            {/* Comment Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Your Comment *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Share your experience or thoughts about this scam..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
                editable={!submitting}
              />
              <Text style={styles.charCount}>{commentText.length}/500</Text>
            </View>

            {/* Form Buttons */}
            <View style={styles.formButtonsContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancelComment}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmitComment}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Post Comment</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

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
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  warningSignItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  warningSignText: {
    flex: 1,
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  reportButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentUsername: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  commentHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  deleteCommentBtn: {
    padding: 4,
  },
  deleteCommentText: {
    fontSize: 16,
  },
  commentText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  addCommentButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addCommentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // COMMENT FORM STYLES
  commentFormContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  commentingAs: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
  formButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default WarningDetailScreen;