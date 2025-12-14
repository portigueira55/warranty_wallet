import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { TicketService } from '../services/tickets';
import { Ticket } from '../types';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface StoreGroup {
  storeName: string;
  tickets: Ticket[];
  totalSpent: number;
  itemCount: number;
}

type NavigationProp = NativeStackNavigationProp<any>;

export const StoresScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [storeGroups, setStoreGroups] = useState<StoreGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const tickets = await TicketService.getTickets(user.id, user.tenantId);

      // Agrupar tickets por tienda
      const groupedMap = new Map<string, Ticket[]>();

      tickets.forEach(ticket => {
        const storeName = ticket.storeName || 'Sin tienda';
        if (!groupedMap.has(storeName)) {
          groupedMap.set(storeName, []);
        }
        groupedMap.get(storeName)!.push(ticket);
      });

      // Convertir a array y calcular estadísticas
      const groups: StoreGroup[] = Array.from(groupedMap.entries()).map(([storeName, tickets]) => {
        const totalSpent = tickets.reduce((sum, ticket) => {
          const ticketTotal = ticket.products.reduce((pSum, product) =>
            pSum + (product.unitPrice * product.quantity), 0
          );
          return sum + ticketTotal;
        }, 0);

        const itemCount = tickets.reduce((sum, ticket) =>
          sum + ticket.products.reduce((pSum, product) => pSum + product.quantity, 0)
        , 0);

        return { storeName, tickets, totalSpent, itemCount };
      });

      // Ordenar por gasto total (descendente)
      groups.sort((a, b) => b.totalSpent - a.totalSpent);

      setStoreGroups(groups);
    } catch (error) {
      console.error('Error cargando tiendas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStoreCard = ({ item }: { item: StoreGroup }) => {
    const activeWarranties = item.tickets.filter(ticket => {
      if (!ticket.warrantyEndDate) return false;
      const endDate = new Date(ticket.warrantyEndDate);
      return endDate > new Date();
    }).length;

    return (
      <TouchableOpacity
        style={styles.storeCard}
        onPress={() => {
          // Navegar a una vista de detalle de la tienda (podemos crearla después)
          // Por ahora, simplemente mostrar el primer ticket
          if (item.tickets.length > 0) {
            navigation.navigate('TicketDetail', { ticketId: item.tickets[0].id });
          }
        }}
      >
        <View style={styles.storeHeader}>
          <View style={styles.storeIconContainer}>
            <Ionicons name="storefront" size={32} color="#1a73e8" />
          </View>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{item.storeName}</Text>
            <Text style={styles.storeStats}>
              {item.tickets.length} ticket{item.tickets.length !== 1 ? 's' : ''} • {item.itemCount} artículo{item.itemCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </View>

        <View style={styles.storeDetails}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Gasto total</Text>
            <Text style={styles.statValue}>{item.totalSpent.toFixed(2)} €</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Garantías activas</Text>
            <Text style={[styles.statValue, { color: activeWarranties > 0 ? '#34a853' : '#999' }]}>
              {activeWarranties}
            </Text>
          </View>
        </View>

        {/* Últimas compras */}
        <View style={styles.recentPurchases}>
          <Text style={styles.recentLabel}>Últimas compras:</Text>
          {item.tickets.slice(0, 3).map((ticket, idx) => (
            <Text key={idx} style={styles.recentItem}>
              • {ticket.products[0]?.name || 'Producto'} - {new Date(ticket.purchaseDate).toLocaleDateString('es-ES')}
            </Text>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text style={styles.loadingText}>Cargando tiendas...</Text>
      </View>
    );
  }

  if (storeGroups.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="storefront-outline" size={80} color="#ccc" />
        <Text style={styles.emptyText}>No hay tickets guardados</Text>
        <Text style={styles.emptySubtext}>
          Agrega tu primer ticket desde la pantalla principal
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Tiendas</Text>
        <Text style={styles.subtitle}>
          {storeGroups.length} tienda{storeGroups.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={storeGroups}
        renderItem={renderStoreCard}
        keyExtractor={(item) => item.storeName}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    color: '#666'
  },
  listContent: {
    padding: 15
  },
  storeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  storeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8f0fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  storeInfo: {
    flex: 1
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4
  },
  storeStats: {
    fontSize: 13,
    color: '#666'
  },
  storeDetails: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  statBox: {
    flex: 1
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a73e8'
  },
  recentPurchases: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  recentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8
  },
  recentItem: {
    fontSize: 13,
    color: '#444',
    marginBottom: 4,
    paddingLeft: 5
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    padding: 20
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center'
  }
});
