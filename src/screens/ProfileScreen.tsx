import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { TicketStorage } from '../services/storage';
import { Ticket } from '../types';
import QRCode from 'react-native-qrcode-svg';

interface UserStats {
  totalTickets: number;
  totalSpent: number;
  activeWarranties: number;
  expiringSoon: number;
  totalProducts: number;
  favoriteStore: string;
}

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalTickets: 0,
    totalSpent: 0,
    activeWarranties: 0,
    expiringSoon: 0,
    totalProducts: 0,
    favoriteStore: 'N/A'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const tickets = await TicketStorage.getTicketsByUser(user.id, user.tenantId);

      // Calcular estadísticas
      const now = new Date();
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

      let totalSpent = 0;
      let activeWarranties = 0;
      let expiringSoon = 0;
      let totalProducts = 0;
      const storeCount = new Map<string, number>();

      tickets.forEach(ticket => {
        // Total gastado
        const ticketTotal = ticket.products.reduce((sum, product) =>
          sum + (product.unitPrice * product.quantity), 0
        );
        totalSpent += ticketTotal;

        // Total productos
        totalProducts += ticket.products.reduce((sum, product) => sum + product.quantity, 0);

        // Garantías
        if (ticket.warrantyEndDate) {
          const endDate = new Date(ticket.warrantyEndDate);
          if (endDate > now) {
            activeWarranties++;
            if (endDate <= threeMonthsFromNow) {
              expiringSoon++;
            }
          }
        }

        // Tienda favorita
        const storeName = ticket.storeName || 'Sin tienda';
        storeCount.set(storeName, (storeCount.get(storeName) || 0) + 1);
      });

      // Encontrar tienda favorita
      let favoriteStore = 'N/A';
      let maxCount = 0;
      storeCount.forEach((count, store) => {
        if (count > maxCount) {
          maxCount = count;
          favoriteStore = store;
        }
      });

      setStats({
        totalTickets: tickets.length,
        totalSpent,
        activeWarranties,
        expiringSoon,
        totalProducts,
        favoriteStore
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtendWarranty = () => {
    Alert.alert(
      'Extender Garantía',
      'Esta funcionalidad estará disponible próximamente. Podrás ampliar la garantía de tus productos directamente desde la app.',
      [{ text: 'Entendido' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', onPress: logout, style: 'destructive' }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con información de usuario */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Text style={styles.username}>{user?.username || 'Usuario'}</Text>
        <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
      </View>

      {/* QR Code para escaneo en tiendas */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => setShowQR(!showQR)}
        >
          <Ionicons name="qr-code" size={24} color="#1a73e8" />
          <Text style={styles.qrButtonText}>
            {showQR ? 'Ocultar' : 'Mostrar'} QR de Cliente
          </Text>
        </TouchableOpacity>

        {showQR && (
          <View style={styles.qrContainer}>
            <QRCode
              value={JSON.stringify({
                userId: user?.id,
                username: user?.username,
                tenantId: user?.tenantId,
                timestamp: Date.now()
              })}
              size={200}
              backgroundColor="#fff"
              color="#000"
            />
            <Text style={styles.qrInfo}>
              Presenta este código en la tienda para acceder a tus garantías
            </Text>
          </View>
        )}
      </View>

      {/* Panel de Estadísticas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen de Actividad</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="receipt" size={28} color="#1a73e8" />
            <Text style={styles.statValue}>{stats.totalTickets}</Text>
            <Text style={styles.statLabel}>Tickets</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="shield-checkmark" size={28} color="#34a853" />
            <Text style={styles.statValue}>{stats.activeWarranties}</Text>
            <Text style={styles.statLabel}>Garantías activas</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="cart" size={28} color="#9333ea" />
            <Text style={styles.statValue}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>Productos</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="cash" size={28} color="#ea8600" />
            <Text style={styles.statValue}>{stats.totalSpent.toFixed(0)} €</Text>
            <Text style={styles.statLabel}>Gastado</Text>
          </View>
        </View>

        <View style={styles.additionalStats}>
          <View style={styles.statRow}>
            <Ionicons name="time" size={20} color="#ea4335" />
            <Text style={styles.statRowText}>
              {stats.expiringSoon} garantía{stats.expiringSoon !== 1 ? 's' : ''} por vencer
            </Text>
          </View>
          <View style={styles.statRow}>
            <Ionicons name="storefront" size={20} color="#1a73e8" />
            <Text style={styles.statRowText}>
              Tienda favorita: {stats.favoriteStore}
            </Text>
          </View>
        </View>
      </View>

      {/* Opción de Extender Garantía */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Servicios Premium</Text>

        <TouchableOpacity
          style={styles.premiumCard}
          onPress={handleExtendWarranty}
        >
          <View style={styles.premiumIcon}>
            <Ionicons name="shield-half" size={32} color="#1a73e8" />
          </View>
          <View style={styles.premiumInfo}>
            <Text style={styles.premiumTitle}>Extender Garantía</Text>
            <Text style={styles.premiumDescription}>
              Amplía la protección de tus productos hasta 5 años
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>Próximamente</Text>
        </View>
      </View>

      {/* Opciones de cuenta */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuenta</Text>

        <TouchableOpacity style={styles.option}>
          <Ionicons name="settings-outline" size={24} color="#666" />
          <Text style={styles.optionText}>Configuración</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Ionicons name="notifications-outline" size={24} color="#666" />
          <Text style={styles.optionText}>Notificaciones</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Ionicons name="help-circle-outline" size={24} color="#666" />
          <Text style={styles.optionText}>Ayuda y Soporte</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, styles.logoutOption]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#ea4335" />
          <Text style={[styles.optionText, styles.logoutText]}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Warranty Wallet v1.0.0</Text>
        <Text style={styles.footerText}>© 2024 Todos los derechos reservados</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa'
  },
  header: {
    backgroundColor: '#1a73e8',
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center'
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4
  },
  email: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)'
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 15,
    padding: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f0fe',
    padding: 15,
    borderRadius: 10
  },
  qrButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a73e8',
    marginLeft: 10
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 10
  },
  qrInfo: {
    marginTop: 15,
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    maxWidth: 250
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5
  },
  statCard: {
    width: '50%',
    padding: 15,
    alignItems: 'center',
    marginBottom: 10
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4
  },
  statLabel: {
    fontSize: 13,
    color: '#666'
  },
  additionalStats: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  statRowText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 10
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  premiumIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8f0fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  premiumInfo: {
    flex: 1
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4
  },
  premiumDescription: {
    fontSize: 13,
    color: '#666'
  },
  comingSoonBadge: {
    marginTop: 10,
    alignItems: 'center'
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ea8600',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12
  },
  logoutOption: {
    borderBottomWidth: 0,
    marginTop: 10
  },
  logoutText: {
    color: '#ea4335'
  },
  footer: {
    padding: 30,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4
  }
});
