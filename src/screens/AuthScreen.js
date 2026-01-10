// src/screens/AuthScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AuthScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLogin = async () => {
    // Validation
    if (!loginEmail.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!loginPassword.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setLoading(true);
    
    const result = await authAPI.login(loginEmail.trim(), loginPassword);
    
    setLoading(false);
    
    if (result.success) {
      // Backend returns user info: { id, username, email }
      await login(result.data);
      
      Alert.alert(
        'Success!',
        'You have logged in successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
    } else {
      Alert.alert('Login Failed', result.error);
    }
  };

  const handleRegister = async () => {
    // Validation
    if (!registerUsername.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }
    if (!registerEmail.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!registerPassword.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }
    if (registerPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    
    const result = await authAPI.register(
      registerUsername.trim(),
      registerEmail.trim(),
      registerPassword
    );
    
    setLoading(false);
    
    if (result.success) {
      Alert.alert(
        'Success!',
        'Your account has been created successfully. Please login.',
        [
          {
            text: 'OK',
            onPress: () => setIsLogin(true)
          }
        ]
      );
    } else {
      Alert.alert('Registration Failed', result.error);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scam Awareness App</Text>
          <Text style={styles.headerSubtitle}>
            {isLogin ? 'Welcome Back!' : 'Create Your Account'}
          </Text>
        </View>

        {/* Toggle Buttons */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>
              Login
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>
              Register
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Form */}
        {isLogin ? (
          <View style={styles.formContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={loginEmail}
              onChangeText={setLoginEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={loginPassword}
              onChangeText={setLoginPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <TouchableOpacity style={styles.forgotPassword} disabled={loading}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => setIsLogin(false)} disabled={loading}>
                <Text style={styles.switchLink}>Register here</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Register Form
          <View style={styles.formContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Choose a username"
              value={registerUsername}
              onChangeText={setRegisterUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={registerEmail}
              onChangeText={setRegisterEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              value={registerPassword}
              onChangeText={setRegisterPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <View style={styles.passwordHint}>
              <Text style={styles.passwordHintText}>
                • Password must be at least 8 characters
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => setIsLogin(true)} disabled={loading}>
                <Text style={styles.switchLink}>Login here</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Terms and Conditions */}
        <Text style={styles.terms}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#666',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  formContainer: {
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  passwordHint: {
    marginTop: 8,
    marginBottom: 20,
  },
  passwordHintText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  switchText: {
    fontSize: 14,
    color: '#666',
  },
  switchLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  terms: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default AuthScreen;