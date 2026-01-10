import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import WarningCard from '../components/WarningCard';
import { warningsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { isLoggedIn, isAdmin, logout } = useAuth();
  
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
      // Limit to first 5 warnings for home screen
      setWarnings(result.data.slice(0, 5));
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

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            Alert.alert('Success', 'You have been logged out');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Latest Scam Warnings</Text>
        <Text style={styles.subtitle}>Stay safe from scams</Text>
        
        {/* Header Buttons Row */}
        <View style={styles.headerButtonsRow}>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('AllWarnings')}
          >
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.addWarningButton}
            onPress={() => navigation.navigate('AddWarning')}
          >
            <Text style={styles.addWarningText}>⚠️ Report Scam</Text>
          </TouchableOpacity>
        </View>
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
      
      {/* BOTTOM BUTTONS */}
      <View style={styles.buttonContainer}>
        {isLoggedIn ? (
          <View style={styles.loggedInButtons}>
            {isAdmin && (
              <TouchableOpacity 
                style={styles.adminButton}
                onPress={() => navigation.navigate('Admin')}
              >
                <Text style={styles.adminButtonText}>🛡️ Admin Panel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => navigation.navigate('Auth')}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.registerButton}
              onPress={() => navigation.navigate('Auth')}
            >
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      
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
    paddingTop: 50,
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
  
  // HEADER BUTTONS ROW
  headerButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  viewAllButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addWarningButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addWarningText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // LIST STYLES
  listContent: {
    padding: 15,
  },
  
  // BUTTON STYLES
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 40,
    gap: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  loginButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  registerButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loggedInButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  adminButton: {
    flex: 1,
    backgroundColor: '#5856D6',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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