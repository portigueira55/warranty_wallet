import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Ticket } from '../types';
import { TicketStorage } from '../services/storage';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

type RouteParams = {
  params: {
    ticket: Ticket;
  };
};

export const TicketDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'params'>>();
  const { user } = useAuth();
  const ticket = route.params.ticket;

  const [timeRemaining, setTimeRemaining] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000); // Actualizar cada segundo
    return () => clearInterval(interval);
  }, []);

  const calculateTimeRemaining = () => {
    const now = new Date();
    const warrantyEnd = new Date(ticket.warrantyEndDate);
    const diff = warrantyEnd.getTime() - now.getTime();

    if (diff <= 0) {
      setTimeRemaining({
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true
      });
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);

    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    setTimeRemaining({
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      isExpired: false
    });
  };

  const handleExtendWarranty = () => {
    navigation.navigate('ExtendedWarranty', { ticket, userId: user?.id });
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Ticket',
      '¿Estás seguro de que quieres eliminar este ticket? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              if (user) {
                await TicketStorage.deleteTicket(ticket.id, user.tenantId);
                navigation.goBack();
              }
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el ticket');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = () => {
    if (timeRemaining.isExpired) return '#d32f2f';
    if (timeRemaining.years === 0 && timeRemaining.months <= 1) return '#f57c00';
    return '#388e3c';
  };

  const getStatusText = () => {
    if (timeRemaining.isExpired) return 'EXPIRADA';
    if (timeRemaining.years === 0 && timeRemaining.months <= 1) return 'POR VENCER';
    return 'ACTIVA';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalAmount = ticket.products.reduce((sum, p) => sum + p.totalPrice, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>Detalle de Garantía</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color="#d32f2f" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Imagen del ticket */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: ticket.imageUri }} style={styles.ticketImage} />
        </View>

        {/* Tarjeta de garantía con temporizador */}
        <View style={[styles.warrantyCard, { borderColor: getStatusColor() }]}>
          <View style={styles.warrantyHeader}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
            <Ionicons
              name={timeRemaining.isExpired ? 'shield-outline' : 'shield-checkmark'}
              size={40}
              color={getStatusColor()}
            />
          </View>

          <Text style={styles.warrantyTitle}>Tiempo de Garantía Restante</Text>

          {!timeRemaining.isExpired ? (
            <>
              <View style={styles.timerContainer}>
                <View style={styles.timerBlock}>
                  <Text style={[styles.timerNumber, { color: getStatusColor() }]}>
                    {timeRemaining.years}
                  </Text>
                  <Text style={styles.timerLabel}>Años</Text>
                </View>
                <View style={styles.timerBlock}>
                  <Text style={[styles.timerNumber, { color: getStatusColor() }]}>
                    {timeRemaining.months}
                  </Text>
                  <Text style={styles.timerLabel}>Meses</Text>
                </View>
                <View style={styles.timerBlock}>
                  <Text style={[styles.timerNumber, { color: getStatusColor() }]}>
                    {timeRemaining.days}
                  </Text>
                  <Text style={styles.timerLabel}>Días</Text>
                </View>
                <View style={styles.timerBlock}>
                  <Text style={[styles.timerNumber, { color: getStatusColor() }]}>
                    {String(timeRemaining.hours).padStart(2, '0')}
                  </Text>
                  <Text style={styles.timerLabel}>Horas</Text>
                </View>
              </View>
              <View style={styles.secondaryTimerContainer}>
                <View style={styles.timerBlock}>
                  <Text style={[styles.timerNumberSmall, { color: getStatusColor() }]}>
                    {String(timeRemaining.minutes).padStart(2, '0')}
                  </Text>
                  <Text style={styles.timerLabelSmall}>Minutos</Text>
                </View>
                <View style={styles.timerBlock}>
                  <Text style={[styles.timerNumberSmall, { color: getStatusColor() }]}>
                    {String(timeRemaining.seconds).padStart(2, '0')}
                  </Text>
                  <Text style={styles.timerLabelSmall}>Segundos</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.expiredContainer}>
              <Ionicons name="alert-circle" size={48} color="#d32f2f" />
              <Text style={styles.expiredText}>La garantía ha expirado</Text>
            </View>
          )}

          <View style={styles.datesRow}>
            <View style={styles.dateBlock}>
              <Text style={styles.dateLabel}>Fecha compra</Text>
              <Text style={styles.dateValue}>{formatDate(ticket.purchaseDate)}</Text>
            </View>
            <View style={styles.dateBlock}>
              <Text style={styles.dateLabel}>Fin garantía</Text>
              <Text style={styles.dateValue}>{formatDate(ticket.warrantyEndDate)}</Text>
            </View>
          </View>

          {/* Botón de extender garantía */}
          {!timeRemaining.isExpired && (
            <TouchableOpacity
              style={styles.extendWarrantyButton}
              onPress={handleExtendWarranty}
              activeOpacity={0.8}
            >
              <Ionicons name="shield-checkmark" size={20} color="#fff" />
              <Text style={styles.extendWarrantyText}>Extender Garantía</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Información del ticket */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Información del Ticket</Text>

          <View style={styles.infoRow}>
            <Ionicons name="storefront-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tienda</Text>
              <Text style={styles.infoValue}>{ticket.storeName}</Text>
              {ticket.storeAddress && (
                <Text style={styles.infoSubValue}>{ticket.storeAddress}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="receipt-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nº Ticket</Text>
              <Text style={styles.infoValue}>{ticket.ticketNumber}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Hora de compra</Text>
              <Text style={styles.infoValue}>{ticket.purchaseTime}</Text>
            </View>
          </View>
        </View>

        {/* Productos */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Productos ({ticket.products.length})</Text>

          {ticket.products.map((product, index) => (
            <View key={product.id} style={styles.productRow}>
              <View style={styles.productIndex}>
                <Text style={styles.productIndexText}>{index + 1}</Text>
              </View>
              <View style={styles.productContent}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productSku}>SKU: {product.sku}</Text>
                <View style={styles.productPriceRow}>
                  <Text style={styles.productQty}>{product.quantity} x {product.unitPrice.toFixed(2)}€</Text>
                  <Text style={styles.productTotal}>{product.totalPrice.toFixed(2)}€</Text>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{totalAmount.toFixed(2)}€</Text>
          </View>
        </View>

        {/* Acciones Rápidas */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Acciones Rápidas</Text>

          <View style={styles.actionsGrid}>
            {/* Calcular Valor de Reventa */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ResaleValue', { ticket })}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#e8f5e9' }]}>
                <Ionicons name="pricetag" size={24} color="#4caf50" />
              </View>
              <Text style={styles.actionLabel}>Valor de Reventa</Text>
            </TouchableOpacity>

            {/* Transferir Garantía */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('TransferWarranty', { ticket, userId: user?.id })}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#e3f2fd' }]}>
                <Ionicons name="swap-horizontal" size={24} color="#2196f3" />
              </View>
              <Text style={styles.actionLabel}>Transferir</Text>
            </TouchableOpacity>

            {/* Hacer Reclamación */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Claims', { ticket, userId: user?.id })}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#fff3e0' }]}>
                <Ionicons name="document-text" size={24} color="#ff9800" />
              </View>
              <Text style={styles.actionLabel}>Reclamación</Text>
            </TouchableOpacity>

            {/* Compartir con Familia */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('FamilyGroup', { userId: user?.id })}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#e8f5e9' }]}>
                <Ionicons name="people" size={24} color="#4caf50" />
              </View>
              <Text style={styles.actionLabel}>Compartir</Text>
            </TouchableOpacity>

            {/* Buscar Producto */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ProductLookup')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#f3e5f5' }]}>
                <Ionicons name="search" size={24} color="#9c27b0" />
              </View>
              <Text style={styles.actionLabel}>Buscar Info</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Metadatos */}
        <View style={styles.metaInfo}>
          <Text style={styles.metaText}>
            Registrado el {formatDate(ticket.createdAt)}
          </Text>
          {ticket.updatedAt !== ticket.createdAt && (
            <Text style={styles.metaText}>
              Última actualización: {formatDate(ticket.updatedAt)}
            </Text>
          )}
        </View>
      </ScrollView>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  scrollContent: {
    paddingBottom: 40
  },
  imageContainer: {
    padding: 16
  },
  ticketImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover'
  },
  warrantyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    marginBottom: 16
  },
  warrantyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700'
  },
  warrantyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12
  },
  secondaryTimerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 20
  },
  timerBlock: {
    alignItems: 'center'
  },
  timerNumber: {
    fontSize: 32,
    fontWeight: 'bold'
  },
  timerNumberSmall: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  timerLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  timerLabelSmall: {
    fontSize: 10,
    color: '#666',
    marginTop: 2
  },
  expiredContainer: {
    alignItems: 'center',
    paddingVertical: 20
  },
  expiredText: {
    fontSize: 16,
    color: '#d32f2f',
    marginTop: 8,
    fontWeight: '500'
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16
  },
  dateBlock: {
    alignItems: 'center'
  },
  dateLabel: {
    fontSize: 12,
    color: '#666'
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginTop: 4
  },
  extendWarrantyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
    gap: 8
  },
  extendWarrantyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center'
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  infoContent: {
    marginLeft: 12,
    flex: 1
  },
  infoLabel: {
    fontSize: 12,
    color: '#666'
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginTop: 2
  },
  infoSubValue: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  productRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  productIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center'
  },
  productIndexText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976d2'
  },
  productContent: {
    flex: 1,
    marginLeft: 12
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a'
  },
  productSku: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
  },
  productQty: {
    fontSize: 12,
    color: '#666'
  },
  productTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#1a1a1a'
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a'
  },
  metaInfo: {
    paddingHorizontal: 16,
    alignItems: 'center'
  },
  metaText: {
    fontSize: 12,
    color: '#999'
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    padding: 16,
    borderRadius: 12
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center'
  }
});
