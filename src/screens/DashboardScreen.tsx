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
import { Ticket } from '../types';
import { WarrantyCard } from '../components/WarrantyCard';
import { NotificationDropdown } from '../components/NotificationDropdown';
import { getMockTickets } from '../services/mockData';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expiringSoon: 0,
    expired: 0,
    totalSpent: 0,
    totalProducts: 0,
    storesCount: 0
  });

  const loadTickets = useCallback(() => {
    // Cargar tickets de ejemplo directamente desde memoria (sin AsyncStorage)
    console.log('📦 Cargando tickets de ejemplo...');
    const mockTickets = getMockTickets();
    console.log(`✅ ${mockTickets.length} tickets cargados`);

    // Ordenar por fecha de creación (más recientes primero)
    const sortedTickets = mockTickets.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setAllTickets(sortedTickets);
    setTickets(sortedTickets);

    // Calcular estadísticas
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    let active = 0;
    let expiringSoon = 0;
    let expired = 0;
    let totalSpent = 0;
    let totalProducts = 0;
    const uniqueStores = new Set<string>();

    mockTickets.forEach(ticket => {
      // Garantías
      const warrantyEnd = new Date(ticket.warrantyEndDate);
      if (warrantyEnd < now) {
        expired++;
      } else if (warrantyEnd < threeMonthsFromNow) {
        expiringSoon++;
        active++;
      } else {
        active++;
      }

      // Gastos y productos
      ticket.products.forEach(product => {
        totalSpent += product.unitPrice * product.quantity;
        totalProducts += product.quantity;
      });

      // Tiendas únicas
      if (ticket.storeName) {
        uniqueStores.add(ticket.storeName);
      }
    });

    setStats({
      total: mockTickets.length,
      active,
      expiringSoon,
      expired,
      totalSpent,
      totalProducts,
      storesCount: uniqueStores.size
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTickets();
    }, [loadTickets])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTickets();
    setRefreshing(false);
  };

  const getNotifications = () => {
    const notifications: any[] = [];
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    tickets.forEach(ticket => {
      const warrantyEnd = new Date(ticket.warrantyEndDate);
      const daysRemaining = Math.ceil((warrantyEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (warrantyEnd > now && warrantyEnd < threeMonthsFromNow) {
        notifications.push({
          id: `warranty-${ticket.id}`,
          type: daysRemaining <= 30 ? 'warning' : 'info',
          title: `Garantía próxima a vencer`,
          message: `${ticket.storeName} - ${ticket.products[0]?.name || 'Producto'} (${daysRemaining} días)`,
          date: `Vence el ${warrantyEnd.toLocaleDateString('es-ES')}`
        });
      }
    });

    return notifications;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Saludo */}
      <View style={styles.greeting}>
        <Text style={styles.welcomeText}>Hola,</Text>
        <Text style={styles.userName}>{user?.username || 'Usuario'}</Text>
      </View>

      {/* Botones de acción */}
      <View style={styles.headerActions}>
        {/* Notificaciones */}
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => setShowNotifications(true)}
        >
          {stats.expiringSoon > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{stats.expiringSoon}</Text>
            </View>
          )}
          <Ionicons name="notifications-outline" size={24} color="#666" />
        </TouchableOpacity>

        {/* Botón Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const filterTicketsByStatus = (status: 'all' | 'active' | 'expiring' | 'expired') => {
    setActiveFilter(status);

    if (status === 'all') {
      setTickets(allTickets);
      return;
    }

    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    const filtered = allTickets.filter(ticket => {
      const warrantyEnd = new Date(ticket.warrantyEndDate);

      switch (status) {
        case 'active':
          return warrantyEnd > now;
        case 'expiring':
          return warrantyEnd > now && warrantyEnd < threeMonthsFromNow;
        case 'expired':
          return warrantyEnd <= now;
        default:
          return true;
      }
    });

    setTickets(filtered);
  };

  const renderStats = () => (
    <View style={styles.statsSection}>
      {/* Panel principal de estadísticas */}
      <View style={styles.mainStatsPanel}>
        <Text style={styles.statsTitle}>Resumen General</Text>

        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}
            onPress={() => filterTicketsByStatus('all')}
            activeOpacity={0.7}
          >
            <Ionicons name="receipt" size={28} color="#1976d2" />
            <Text style={[styles.statNumber, { color: '#1976d2' }]}>{stats.total}</Text>
            <Text style={styles.statLabel}>Tickets</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}
            onPress={() => filterTicketsByStatus('active')}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-checkmark" size={28} color="#388e3c" />
            <Text style={[styles.statNumber, { color: '#388e3c' }]}>{stats.active}</Text>
            <Text style={styles.statLabel}>Activas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#fff3e0' }]}
            onPress={() => filterTicketsByStatus('expiring')}
            activeOpacity={0.7}
          >
            <Ionicons name="time" size={28} color="#f57c00" />
            <Text style={[styles.statNumber, { color: '#f57c00' }]}>{stats.expiringSoon}</Text>
            <Text style={styles.statLabel}>Por vencer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#ffebee' }]}
            onPress={() => filterTicketsByStatus('expired')}
            activeOpacity={0.7}
          >
            <Ionicons name="alert-circle" size={28} color="#d32f2f" />
            <Text style={[styles.statNumber, { color: '#d32f2f' }]}>{stats.expired}</Text>
            <Text style={styles.statLabel}>Vencidas</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Panel de datos adicionales */}
      <View style={styles.additionalStatsPanel}>
        <View style={styles.detailStatRow}>
          <View style={styles.detailStatIcon}>
            <Ionicons name="cube" size={24} color="#9333ea" />
          </View>
          <View style={styles.detailStatInfo}>
            <Text style={styles.detailStatLabel}>Productos registrados</Text>
            <Text style={styles.detailStatValue}>{stats.totalProducts}</Text>
          </View>
        </View>

        <View style={styles.detailStatRow}>
          <View style={styles.detailStatIcon}>
            <Ionicons name="storefront" size={24} color="#ea8600" />
          </View>
          <View style={styles.detailStatInfo}>
            <Text style={styles.detailStatLabel}>Tiendas diferentes</Text>
            <Text style={styles.detailStatValue}>{stats.storesCount}</Text>
          </View>
        </View>
      </View>

      {/* Alerta de garantías próximas a vencer */}
      {stats.expiringSoon > 0 && (
        <View style={styles.alertPanel}>
          <Ionicons name="warning" size={20} color="#f57c00" />
          <Text style={styles.alertText}>
            Tienes {stats.expiringSoon} garantía{stats.expiringSoon > 1 ? 's' : ''} que vence
            {stats.expiringSoon > 1 ? 'n' : ''} en los próximos 3 meses
          </Text>
        </View>
      )}
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

      {/* Dropdown de notificaciones */}
      <NotificationDropdown
        visible={showNotifications}
        notifications={getNotifications()}
        onClose={() => setShowNotifications(false)}
        onNotificationPress={(notification) => {
          // Aquí podrías navegar al ticket específico
          console.log('Notificación presionada:', notification);
        }}
      />
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  notificationButton: {
    padding: 8,
    position: 'relative'
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ea4335',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4
  },
  logoutButton: {
    padding: 8
  },
  statsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  mainStatsPanel: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  statCard: {
    width: isTablet ? '23%' : '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center'
  },
  additionalStatsPanel: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  detailStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  detailStatIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  detailStatInfo: {
    flex: 1
  },
  detailStatLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4
  },
  detailStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937'
  },
  alertPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    borderLeftWidth: 4,
    borderLeftColor: '#f57c00',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: '#e65100',
    marginLeft: 12,
    lineHeight: 20
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
