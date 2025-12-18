import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransferService } from '../services/transferService';
import { User, Ticket } from '../types';

export const TransferWarrantyScreen: React.FC<any> = ({
  route,
  navigation
}) => {
  const { ticket, userId } = route.params;

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [transferReason, setTransferReason] = useState('');
  const [transferring, setTransferring] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 3) {
      Alert.alert('Error', 'Introduce al menos 3 caracteres para buscar');
      return;
    }

    setSearching(true);
    try {
      const results = await TransferService.searchUser(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        Alert.alert('Sin resultados', 'No se encontraron usuarios con ese email o teléfono');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo realizar la búsqueda');
    } finally {
      setSearching(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedUser) {
      Alert.alert('Error', 'Selecciona un usuario para transferir');
      return;
    }

    Alert.alert(
      'Confirmar transferencia',
      `¿Estás seguro de transferir esta garantía a ${selectedUser.name}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Transferir',
          style: 'destructive',
          onPress: async () => {
            setTransferring(true);
            try {
              const result = await TransferService.transferWarranty(
                ticket.id,
                userId,
                selectedUser.id,
                transferReason || undefined
              );

              if (result.success) {
                Alert.alert(
                  'Transferencia exitosa',
                  result.message,
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.goBack()
                    }
                  ]
                );
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              Alert.alert('Error', 'No se pudo completar la transferencia');
            } finally {
              setTransferring(false);
            }
          }
        }
      ]
    );
  };

  const productName = ticket.products[0]?.name || 'Producto';

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transferir Garantía</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Product Info */}
      <View style={styles.productCard}>
        <Ionicons name="gift-outline" size={40} color="#1a73e8" />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{productName}</Text>
          <Text style={styles.productDetail}>{ticket.storeName}</Text>
          <Text style={styles.productDetail}>
            Ticket: {ticket.ticketNumber || 'N/A'}
          </Text>
        </View>
      </View>

      {/* Search Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Buscar destinatario</Text>
        <Text style={styles.sectionDescription}>
          Introduce el email o teléfono del usuario
        </Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Email o teléfono"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={searching}
          >
            {searching ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="search" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            {searchResults.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.userCard,
                  selectedUser?.id === user.id && styles.userCardSelected
                ]}
                onPress={() => setSelectedUser(user)}
              >
                <View style={styles.userAvatar}>
                  <Ionicons
                    name="person"
                    size={24}
                    color={selectedUser?.id === user.id ? '#fff' : '#666'}
                  />
                </View>
                <View style={styles.userInfo}>
                  <Text style={[
                    styles.userName,
                    selectedUser?.id === user.id && styles.userNameSelected
                  ]}>
                    {user.name}
                  </Text>
                  <Text style={[
                    styles.userEmail,
                    selectedUser?.id === user.id && styles.userEmailSelected
                  ]}>
                    {user.email}
                  </Text>
                </View>
                {selectedUser?.id === user.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Reason (Optional) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Motivo (opcional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Ej: Venta del producto, regalo, etc."
          value={transferReason}
          onChangeText={setTransferReason}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Transfer Button */}
      <TouchableOpacity
        style={[
          styles.transferButton,
          (!selectedUser || transferring) && styles.transferButtonDisabled
        ]}
        onPress={handleTransfer}
        disabled={!selectedUser || transferring}
      >
        {transferring ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="swap-horizontal" size={20} color="#fff" />
            <Text style={styles.transferButtonText}>Transferir Garantía</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Warning */}
      <View style={styles.warningCard}>
        <Ionicons name="warning-outline" size={24} color="#f57c00" />
        <Text style={styles.warningText}>
          Una vez transferida, no podrás acceder a esta garantía. El nuevo propietario
          tendrá control total sobre ella.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  productInfo: {
    flex: 1,
    marginLeft: 12
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4
  },
  productDetail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4
  },
  sectionDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a1a'
  },
  searchButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  resultsContainer: {
    marginTop: 16,
    gap: 8
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  userCardSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1a73e8'
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2
  },
  userNameSelected: {
    color: '#1a73e8'
  },
  userEmail: {
    fontSize: 13,
    color: '#666'
  },
  userEmailSelected: {
    color: '#1565c0'
  },
  textArea: {
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1a1a1a',
    minHeight: 80
  },
  transferButton: {
    flexDirection: 'row',
    backgroundColor: '#1a73e8',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  transferButtonDisabled: {
    backgroundColor: '#ccc'
  },
  transferButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#fff3e0',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
    gap: 12
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#e65100',
    lineHeight: 18
  }
});
