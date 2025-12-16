import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ResaleValueService } from '../services/resaleValueService';
import { Ticket, ResaleValue } from '../types';

interface ResaleValueScreenProps {
  route: {
    params: {
      ticket: Ticket;
    };
  };
  navigation: any;
}

export const ResaleValueScreen: React.FC<ResaleValueScreenProps> = ({
  route,
  navigation
}) => {
  const { ticket } = route.params;
  const product = ticket.products[0];

  const [loading, setLoading] = useState(true);
  const [selectedCondition, setSelectedCondition] = useState<ResaleValue['condition']>('good');
  const [resaleValue, setResaleValue] = useState<ResaleValue | null>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [marketPrices, setMarketPrices] = useState<any>(null);

  useEffect(() => {
    calculateValue();
  }, [selectedCondition]);

  const calculateValue = async () => {
    setLoading(true);
    try {
      // Calculate resale value
      const value = ResaleValueService.calculateResaleValue(
        product,
        ticket.purchaseDate,
        ticket.warrantyEndDate,
        selectedCondition
      );
      setResaleValue(value);

      // Get recommendations
      const recs = ResaleValueService.getSellingRecommendations(value);
      setRecommendations(recs);

      // Get market prices
      const prices = await ResaleValueService.getMarketPrices(product.name, product.brand);
      setMarketPrices(prices);
    } catch (error) {
      Alert.alert('Error', 'No se pudo calcular el valor de reventa');
    } finally {
      setLoading(false);
    }
  };

  const conditions: Array<{ value: ResaleValue['condition']; label: string; icon: string }> = [
    { value: 'new', label: 'Como nuevo', icon: 'star' },
    { value: 'excellent', label: 'Excelente', icon: 'star-half' },
    { value: 'good', label: 'Bueno', icon: 'checkmark-circle' },
    { value: 'fair', label: 'Aceptable', icon: 'remove-circle' },
    { value: 'poor', label: 'Malo', icon: 'close-circle' }
  ];

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'low': return '#f44336';
      default: return '#999';
    }
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text style={styles.loadingText}>Calculando valor de reventa...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Valor de Reventa</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Product Info */}
      <View style={styles.productCard}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productBrand}>{product.brand}</Text>
      </View>

      {/* Main Value Card */}
      <View style={styles.valueCard}>
        <Text style={styles.valueLabel}>Valor estimado de reventa</Text>
        <Text style={styles.valueAmount}>
          {resaleValue && formatCurrency(resaleValue.estimatedResalePrice)}
        </Text>
        <View style={styles.confidenceBadge}>
          <View style={[
            styles.confidenceDot,
            { backgroundColor: getConfidenceColor(resaleValue?.confidenceLevel || 'medium') }
          ]} />
          <Text style={styles.confidenceText}>
            Confianza: {resaleValue?.confidenceLevel === 'high' ? 'Alta' :
              resaleValue?.confidenceLevel === 'medium' ? 'Media' : 'Baja'}
          </Text>
        </View>
      </View>

      {/* Condition Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado del producto</Text>
        <View style={styles.conditionsGrid}>
          {conditions.map((condition) => (
            <TouchableOpacity
              key={condition.value}
              style={[
                styles.conditionCard,
                selectedCondition === condition.value && styles.conditionCardSelected
              ]}
              onPress={() => setSelectedCondition(condition.value)}
            >
              <Ionicons
                name={condition.icon as any}
                size={24}
                color={selectedCondition === condition.value ? '#1a73e8' : '#666'}
              />
              <Text style={[
                styles.conditionLabel,
                selectedCondition === condition.value && styles.conditionLabelSelected
              ]}>
                {condition.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Price Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Desglose de precio</Text>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Precio original</Text>
          <Text style={styles.breakdownValue}>
            {resaleValue && formatCurrency(resaleValue.originalPrice)}
          </Text>
        </View>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Valor actual (depreciación)</Text>
          <Text style={[styles.breakdownValue, { color: '#f44336' }]}>
            {resaleValue && formatCurrency(resaleValue.currentValue)}
          </Text>
        </View>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>
            Depreciación: {resaleValue && (resaleValue.depreciationRate * 100).toFixed(0)}%
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Bonus por garantía vigente</Text>
          <Text style={[styles.breakdownValue, { color: '#4caf50' }]}>
            +{resaleValue && formatCurrency(resaleValue.warrantyValueBonus)}
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.breakdownRow}>
          <Text style={[styles.breakdownLabel, { fontWeight: '600', fontSize: 15 }]}>
            Precio sugerido de venta
          </Text>
          <Text style={[styles.breakdownValue, { fontWeight: '700', fontSize: 18, color: '#1a73e8' }]}>
            {resaleValue && formatCurrency(resaleValue.estimatedResalePrice)}
          </Text>
        </View>
      </View>

      {/* Selling Recommendations */}
      {recommendations && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recomendaciones de venta</Text>

          <View style={styles.priceRangeCard}>
            <Text style={styles.priceRangeLabel}>Rango de precio sugerido</Text>
            <Text style={styles.priceRangeValue}>
              {formatCurrency(recommendations.suggestedPrice * 0.9)} - {formatCurrency(recommendations.suggestedPrice * 1.1)}
            </Text>
            <Text style={styles.priceRangeStrategy}>{recommendations.pricingStrategy}</Text>
          </View>

          <View style={styles.tipsList}>
            {recommendations.tips.map((tip: string, index: number) => (
              <View key={index} style={styles.tipItem}>
                <Ionicons name="bulb" size={20} color="#ff9800" />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Market Prices */}
      {marketPrices && marketPrices.listings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Precios en el mercado</Text>
          <Text style={styles.sectionDescription}>
            Productos similares actualmente a la venta
          </Text>

          {marketPrices.listings.map((listing: any, index: number) => (
            <View key={index} style={styles.listingCard}>
              <View style={styles.listingHeader}>
                <Text style={styles.listingPrice}>{formatCurrency(listing.price)}</Text>
                <View style={[styles.listingConditionBadge, {
                  backgroundColor: listing.condition === 'new' ? '#e8f5e9' :
                    listing.condition === 'excellent' ? '#e3f2fd' : '#fff3e0'
                }]}>
                  <Text style={styles.listingConditionText}>
                    {listing.condition === 'new' ? 'Nuevo' :
                      listing.condition === 'excellent' ? 'Excelente' : 'Bueno'}
                  </Text>
                </View>
              </View>
              <Text style={styles.listingPlatform}>📍 {listing.platform}</Text>
              <Text style={styles.listingDate}>
                Publicado: {new Date(listing.date).toLocaleDateString('es-ES')}
              </Text>
            </View>
          ))}

          <View style={styles.averagePriceCard}>
            <Text style={styles.averagePriceLabel}>Precio promedio del mercado</Text>
            <Text style={styles.averagePriceValue}>
              {formatCurrency(marketPrices.averagePrice)}
            </Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social" size={20} color="#1a73e8" />
          <Text style={styles.actionButtonText}>Compartir valoración</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButtonPrimary}>
          <Ionicons name="pricetag" size={20} color="#fff" />
          <Text style={styles.actionButtonTextPrimary}>Publicar en venta</Text>
        </TouchableOpacity>
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
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666'
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
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4
  },
  productBrand: {
    fontSize: 14,
    color: '#666'
  },
  valueCard: {
    backgroundColor: '#1a73e8',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center'
  },
  valueLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8
  },
  valueAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  confidenceText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600'
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
    marginBottom: 12
  },
  sectionDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12
  },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  conditionCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#f5f7fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  conditionCardSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1a73e8'
  },
  conditionLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    textAlign: 'center'
  },
  conditionLabelSelected: {
    color: '#1a73e8',
    fontWeight: '600'
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#666'
  },
  breakdownValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8
  },
  priceRangeCard: {
    backgroundColor: '#f5f7fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16
  },
  priceRangeLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4
  },
  priceRangeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a73e8',
    marginBottom: 8
  },
  priceRangeStrategy: {
    fontSize: 13,
    color: '#1a1a1a',
    fontStyle: 'italic'
  },
  tipsList: {
    gap: 12
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#1a1a1a',
    lineHeight: 18
  },
  listingCard: {
    backgroundColor: '#f5f7fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  listingPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a73e8'
  },
  listingConditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  listingConditionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  listingPlatform: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2
  },
  listingDate: {
    fontSize: 11,
    color: '#999'
  },
  averagePriceCard: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center'
  },
  averagePriceLabel: {
    fontSize: 13,
    color: '#2e7d32',
    marginBottom: 4
  },
  averagePriceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1b5e20'
  },
  actionsContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#1a73e8'
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a73e8'
  },
  actionButtonPrimary: {
    flexDirection: 'row',
    backgroundColor: '#1a73e8',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  actionButtonTextPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff'
  }
});
