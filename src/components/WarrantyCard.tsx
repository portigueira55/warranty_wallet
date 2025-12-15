import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ticket } from '../types';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

interface WarrantyCardProps {
  ticket: Ticket;
  onPress: () => void;
}

export const WarrantyCard: React.FC<WarrantyCardProps> = ({ ticket, onPress }) => {
  const [timeRemaining, setTimeRemaining] = useState({
    years: 0,
    months: 0,
    days: 0,
    isExpired: false,
    percentage: 100
  });

  useEffect(() => {
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, []);

  const calculateTimeRemaining = () => {
    const now = new Date();
    const purchaseDate = new Date(ticket.purchaseDate);
    const warrantyEnd = new Date(ticket.warrantyEndDate);

    const totalDuration = warrantyEnd.getTime() - purchaseDate.getTime();
    const remaining = warrantyEnd.getTime() - now.getTime();
    const percentage = Math.max(0, Math.min(100, (remaining / totalDuration) * 100));

    if (remaining <= 0) {
      setTimeRemaining({
        years: 0,
        months: 0,
        days: 0,
        isExpired: true,
        percentage: 0
      });
      return;
    }

    const totalDays = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;

    setTimeRemaining({
      years,
      months,
      days,
      isExpired: false,
      percentage
    });
  };

  const getStatusColor = () => {
    if (timeRemaining.isExpired) return '#d32f2f';
    if (timeRemaining.years === 0 && timeRemaining.months <= 1) return '#f57c00';
    return '#388e3c';
  };

  const getStatusBgColor = () => {
    if (timeRemaining.isExpired) return '#ffebee';
    if (timeRemaining.years === 0 && timeRemaining.months <= 1) return '#fff3e0';
    return '#e8f5e9';
  };

  const formatTimeRemaining = () => {
    if (timeRemaining.isExpired) return 'Expirada';

    const parts = [];
    if (timeRemaining.years > 0) parts.push(`${timeRemaining.years}a`);
    if (timeRemaining.months > 0) parts.push(`${timeRemaining.months}m`);
    if (timeRemaining.days > 0) parts.push(`${timeRemaining.days}d`);

    return parts.join(' ') || 'Expira hoy';
  };

  const totalProducts = ticket.products.length;
  const totalAmount = ticket.products.reduce((sum, p) => sum + p.totalPrice, 0);

  return (
    <TouchableOpacity
      style={[styles.card, isTablet && styles.cardTablet]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Imagen thumbnail */}
      <View style={styles.imageContainer}>
        {ticket.imageUri ? (
          <Image source={{ uri: ticket.imageUri }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderContainer]}>
            <Ionicons name="receipt-outline" size={40} color="#ccc" />
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor() }]}>
          <Ionicons
            name={timeRemaining.isExpired ? 'close-circle' : 'shield-checkmark'}
            size={12}
            color={getStatusColor()}
          />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {formatTimeRemaining()}
          </Text>
        </View>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.storeName} numberOfLines={1}>
            {ticket.storeName}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>

        <Text style={styles.ticketNumber}>Ticket #{ticket.ticketNumber}</Text>

        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.detailText}>
              {new Date(ticket.purchaseDate).toLocaleDateString('es-ES')}
            </Text>
          </View>
          <View style={styles.detail}>
            <Ionicons name="cube-outline" size={14} color="#666" />
            <Text style={styles.detailText}>
              {totalProducts} producto{totalProducts !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Barra de progreso de garantía */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${timeRemaining.percentage}%`,
                  backgroundColor: getStatusColor()
                }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: getStatusColor() }]}>
            {Math.round(timeRemaining.percentage)}%
          </Text>
        </View>

        {/* Precio total */}
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Total:</Text>
          <Text style={styles.priceValue}>{totalAmount.toFixed(2)}€</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardTablet: {
    marginHorizontal: 8,
    flex: 1,
    maxWidth: (width - 48) / 2
  },
  imageContainer: {
    width: 100,
    position: 'relative'
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    minHeight: 140
  },
  placeholderContainer: {
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    alignItems: 'center'
  },
  statusBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4
  },
  content: {
    flex: 1,
    padding: 12
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1
  },
  ticketNumber: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  detailsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 3
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 8,
    width: 35,
    textAlign: 'right'
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8
  },
  priceLabel: {
    fontSize: 12,
    color: '#666'
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: 4
  }
});
