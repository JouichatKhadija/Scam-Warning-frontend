import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function WarningCard({ warning, onPress }) {
  return (
    <TouchableOpacity 
      style={styles.warningCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Category Badge */}
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{warning.categoryEmoji || '⚠️'} {warning.category || warning.categoryName}</Text>
      </View>
      
      {/* Title */}
      <Text style={styles.warningTitle}>{warning.title}</Text>
      
      {/* Description */}
      <Text style={styles.warningDescription} numberOfLines={2}>
        {warning.description}
      </Text>
      
      {/* Read More Indicator */}
      <Text style={styles.readMore}>Tap to read more →</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  warningCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 10,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  warningDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  readMore: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});