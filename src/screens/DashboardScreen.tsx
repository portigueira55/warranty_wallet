import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { TicketStorage } from '../services/storage';
import { Ticket } from '../types';
import { WarrantyCard } from '../components/WarrantyCard';
import { loadSampleData } from '../utils/sampleData';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expiringSoon: 0,
    expired: 0
  });

  const loadTickets = useCallback(async () => {
    if (!user) return;

    try {
      const userTickets = await TicketStorage.getTicketsByUser(user.id, user.tenantId);
      setTickets(userTickets.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));

      // Calcular estadísticas
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      let active = 0;
      let expiringSoon = 0;
      let expired = 0;

      userTickets.forEach(ticket => {
        const warrantyEnd = new Date(ticket.warrantyEndDate);
        if (warrantyEnd < now) {
          expired++;
        } else if (warrantyEnd < thirtyDaysFromNow) {
          expiringSoon++;
          active++;
        } else {
          active++;
        }
      });

      setStats({
        total: userTickets.length,
        active,
        expiringSoon,
        expired
      });
    } catch (error) {
      console.error('Error cargando tickets:', error);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadTickets();
    }, [loadTickets])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTickets();
    setRefreshing(false);
  };

  const handleLoadSampleData = async () => {
    if (!user) return;

    Alert.alert(
      'Cargar datos de ejemplo',
      '¿Deseas cargar 7 tickets de ejemplo con productos en diferentes estados de garantía (vigente, próxima a vencer y vencida)?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Cargar',
          onPress: async () => {
            try {
              setRefreshing(true);
              await loadSampleData(user.id, user.tenantId);
              await loadTickets();
              setRefreshing(false);
              Alert.alert(
                'Éxito',
                'Se han cargado 7 tickets de ejemplo con productos en diferentes estados de garantía'
              );
            } catch (error) {
              console.error('Error cargando datos de ejemplo:', error);
              setRefreshing(false);
              Alert.alert('Error', 'No se pudieron cargar los datos de ejemplo');
            }
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Saludo */}
      <View style={styles.greeting}>
        <Text style={styles.welcomeText}>Hola,</Text>
        <Text style={styles.userName}>{user?.username || 'Usuario'}</Text>
      </View>

      {/* Botón Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
        <Ionicons name="receipt-outline" size={24} color="#1976d2" />
        <Text style={[styles.statNumber, { color: '#1976d2' }]}>{stats.total}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>

      <View style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
        <Ionicons name="shield-checkmark-outline" size={24} color="#388e3c" />
        <Text style={[styles.statNumber, { color: '#388e3c' }]}>{stats.active}</Text>
        <Text style={styles.statLabel}>Activas</Text>
      </View>

      <View style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
        <Ionicons name="warning-outline" size={24} color="#f57c00" />
        <Text style={[styles.statNumber, { color: '#f57c00' }]}>{stats.expiringSoon}</Text>
        <Text style={styles.statLabel}>Por vencer</Text>
      </View>

      <View style={[styles.statCard, { backgroundColor: '#ffebee' }]}>
        <Ionicons name="close-circle-outline" size={24} color="#d32f2f" />
        <Text style={[styles.statNumber, { color: '#d32f2f' }]}>{stats.expired}</Text>
        <Text style={styles.statLabel}>Vencidas</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>Sin garantías registradas</Text>
      <Text style={styles.emptyText}>
        Añade tu primer ticket de compra para comenzar a gestionar tus garantías
      </Text>
      <TouchableOpacity
        style={styles.addFirstButton}
        onPress={() => navigation.navigate('AddTicket')}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addFirstButtonText}>Añadir Ticket</Text>
      </TouchableOpacity>

      {/* Botón para cargar datos de ejemplo */}
      <TouchableOpacity
        style={styles.sampleDataButton}
        onPress={handleLoadSampleData}
      >
        <Ionicons name="albums-outline" size={18} color="#1a73e8" />
        <Text style={styles.sampleDataButtonText}>Cargar datos de ejemplo</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTicketItem = ({ item }: { item: Ticket }) => (
    <WarrantyCard
      ticket={item}
      onPress={() => navigation.navigate('TicketDetail', { ticket: item })}
    />
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={renderTicketItem}
        ListHeaderComponent={
          <>
            {renderStats()}
            {tickets.length > 0 && (
              <Text style={styles.sectionTitle}>Mis Garantías</Text>
            )}
          </>
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        numColumns={isTablet ? 2 : 1}
        key={isTablet ? 'tablet' : 'phone'}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1a73e8']}
          />
        }
      />

      {/* FAB para añadir ticket */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTicket')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff'
  },
  greeting: {
    flexDirection: 'column'
  },
  welcomeText: {
    fontSize: 14,
    color: '#666'
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a'
  },
  logoutButton: {
    padding: 8
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  statCard: {
    width: isTablet ? '23%' : '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12
  },
  listContent: {
    paddingBottom: 100
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a73e8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  sampleDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#1a73e8'
  },
  sampleDataButtonText: {
    color: '#1a73e8',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a73e8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  }
});
