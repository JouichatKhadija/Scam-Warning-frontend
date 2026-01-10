import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import WarningCard from '../components/WarningCard';
import { warningsAPI } from '../services/api';

export default function AllWarningsScreen({ navigation }) {
  
  // State for API data
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch warnings on mount
  useEffect(() => {
    fetchWarnings();
  }, []);

  // Fetch warnings from API
  const fetchWarnings = async () => {
    setLoading(true);
    setError(null);
    
    const result = await warningsAPI.getAll();
    
    if (result.success) {
      setWarnings(result.data);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  // 🎯 Handle card press
  const handleWarningPress = (warningId) => {
    navigation.navigate('WarningDetail', { warningId: warningId });
  };

  // 🎨 Render each warning card
  const renderWarningItem = ({ item }) => (
    <WarningCard 
      warning={item}
      onPress={() => handleWarningPress(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>All Scam Warnings</Text>
        <Text style={styles.subtitle}>{warnings.length} warnings available</Text>
      </View>
      
      {/* LOADING STATE */}
      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading warnings...</Text>
        </View>
      )}
      
      {/* ERROR STATE */}
      {error && !loading && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchWarnings}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* WARNINGS LIST */}
      {!loading && !error && (
        <FlatList
          data={warnings}
          renderItem={renderWarningItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // HEADER STYLES
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  
  // LIST STYLES
  listContent: {
    padding: 15,
    paddingBottom: 30,
  },
  
  // LOADING AND ERROR STYLES
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});