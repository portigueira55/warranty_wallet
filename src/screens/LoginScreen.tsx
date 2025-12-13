import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');

  const { login, register, isLoading } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    const success = await login(username.trim(), password);

    if (!success) {
      Alert.alert('Error', 'Usuario o contraseña incorrectos');
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !password.trim() || !email.trim()) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    if (password.length < 4) {
      Alert.alert('Error', 'La contraseña debe tener al menos 4 caracteres');
      return;
    }

    const success = await register(username.trim(), email.trim(), password);

    if (!success) {
      Alert.alert('Error', 'No se pudo crear la cuenta. El usuario puede ya existir.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo y Título */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="wallet" size={60} color="#1a73e8" />
          </View>
          <Text style={styles.title}>Warranty Wallet</Text>
          <Text style={styles.subtitle}>Gestiona tus garantías de forma segura</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Usuario"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {isRegistering && (
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={isRegistering ? handleRegister : handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setIsRegistering(!isRegistering);
              setEmail('');
            }}
          >
            <Text style={styles.switchText}>
              {isRegistering
                ? '¿Ya tienes cuenta? Inicia sesión'
                : '¿No tienes cuenta? Regístrate'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Demo */}
        <View style={styles.demoInfo}>
          <Text style={styles.demoTitle}>Credenciales Demo:</Text>
          <Text style={styles.demoText}>Usuario: admin | Contraseña: 1234</Text>
        </View>

        {/* Footer seguridad */}
        <View style={styles.securityBadge}>
          <Ionicons name="shield-checkmark" size={16} color="#28a745" />
          <Text style={styles.securityText}>Datos cifrados con AES-256</Text>
        </View>

        {/* Versión */}
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>
            v{Constants.expoConfig?.version || '1.0.1'}
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 40
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e8f0fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#fafafa'
  },
  inputIcon: {
    paddingLeft: 16
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1a1a1a'
  },
  eyeIcon: {
    padding: 16
  },
  button: {
    backgroundColor: '#1a73e8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  switchButton: {
    marginTop: 16,
    alignItems: 'center'
  },
  switchText: {
    color: '#1a73e8',
    fontSize: 14
  },
  demoInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    alignItems: 'center'
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4
  },
  demoText: {
    fontSize: 12,
    color: '#856404'
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24
  },
  securityText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#28a745'
  },
  versionBadge: {
    alignItems: 'center',
    marginTop: 12
  },
  versionText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500'
  }
});
