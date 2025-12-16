import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExtendedWarrantyService } from '../services/extendedWarrantyService';
import { Ticket, WarrantyExtension, Product } from '../types';

export const ExtendedWarrantyScreen: React.FC<any> = ({
  route,
  navigation
}) => {
  const userId = route?.params?.userId || 'mock-user';
  const ticket = route?.params?.ticket;

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-extensions' | 'purchase'>('my-extensions');
  const [myExtensions, setMyExtensions] = useState<WarrantyExtension[]>([]);
  const [selectedExtension, setSelectedExtension] = useState<WarrantyExtension | null>(null);

  useEffect(() => {
    loadExtensions();
  }, []);

  const loadExtensions = async () => {
    setLoading(true);
    try {
      const extensions = await ExtendedWarrantyService.getUserExtensions(userId);
      setMyExtensions(extensions);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las extensiones');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'expired': return '#f44336';
      case 'cancelled': return '#999';
      default: return '#999';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'pending': return 'Pendiente';
      case 'expired': return 'Expirada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const daysRemaining = diff / (1000 * 60 * 60 * 24);
    return daysRemaining <= 30 && daysRemaining > 0;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text style={styles.loadingText}>Cargando extensiones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Garantías Extendidas</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-extensions' && styles.tabActive]}
          onPress={() => setActiveTab('my-extensions')}
        >
          <Ionicons
            name="shield-checkmark"
            size={20}
            color={activeTab === 'my-extensions' ? '#1a73e8' : '#666'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'my-extensions' && styles.tabTextActive
          ]}>
            Mis Extensiones
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'purchase' && styles.tabActive]}
          onPress={() => setActiveTab('purchase')}
        >
          <Ionicons
            name="cart"
            size={20}
            color={activeTab === 'purchase' ? '#1a73e8' : '#666'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'purchase' && styles.tabTextActive
          ]}>
            Comprar
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'my-extensions' ? (
          myExtensions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="shield-outline" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No tienes extensiones</Text>
              <Text style={styles.emptyText}>
                Compra una garantía extendida para proteger tus productos por más tiempo
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setActiveTab('purchase')}
              >
                <Ionicons name="cart" size={20} color="#fff" />
                <Text style={styles.emptyButtonText}>Comprar Extensión</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.extensionsList}>
              {myExtensions.map((extension) => (
                <TouchableOpacity
                  key={extension.id}
                  style={styles.extensionCard}
                  onPress={() => setSelectedExtension(extension)}
                >
                  {/* Header */}
                  <View style={styles.extensionHeader}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(extension.status)}15` }
                    ]}>
                      <View style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(extension.status) }
                      ]} />
                      <Text style={[
                        styles.statusText,
                        { color: getStatusColor(extension.status) }
                      ]}>
                        {getStatusLabel(extension.status)}
                      </Text>
                    </View>

                    {isExpiringSoon(extension.endDate) && (
                      <View style={styles.warningBadge}>
                        <Ionicons name="warning" size={14} color="#ff9800" />
                        <Text style={styles.warningText}>Por vencer</Text>
                      </View>
                    )}
                  </View>

                  {/* Provider */}
                  <View style={styles.providerRow}>
                    <Ionicons name="business" size={20} color="#1a73e8" />
                    <Text style={styles.providerName}>{extension.provider}</Text>
                  </View>

                  {/* Policy Number */}
                  <View style={styles.policyRow}>
                    <Text style={styles.policyLabel}>Póliza:</Text>
                    <Text style={styles.policyNumber}>{extension.policyNumber}</Text>
                  </View>

                  {/* Dates */}
                  <View style={styles.datesRow}>
                    <View style={styles.dateItem}>
                      <Ionicons name="calendar-outline" size={16} color="#666" />
                      <View>
                        <Text style={styles.dateLabel}>Inicio</Text>
                        <Text style={styles.dateValue}>
                          {new Date(extension.startDate).toLocaleDateString('es-ES')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.dateSeparator} />
                    <View style={styles.dateItem}>
                      <Ionicons name="calendar" size={16} color="#666" />
                      <View>
                        <Text style={styles.dateLabel}>Fin</Text>
                        <Text style={styles.dateValue}>
                          {new Date(extension.endDate).toLocaleDateString('es-ES')}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Cost */}
                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Costo</Text>
                    <Text style={styles.costValue}>€{extension.cost.toFixed(2)}</Text>
                  </View>

                  {/* Claims */}
                  {extension.claimLimit !== null && (
                    <View style={styles.claimsRow}>
                      <Ionicons name="document-text-outline" size={16} color="#666" />
                      <Text style={styles.claimsText}>
                        Reclamos: {extension.claimsUsed}/{extension.claimLimit}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )
        ) : (
          <PurchaseExtensionTab ticket={ticket} navigation={navigation} />
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#1a73e8" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>¿Qué es una garantía extendida?</Text>
            <Text style={styles.infoText}>
              Extiende la protección de tus productos más allá de la garantía del fabricante.
              Cubre defectos, averías y en algunos casos, daños accidentales.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Extension Detail Modal */}
      {selectedExtension && (
        <ExtensionDetailModal
          visible={!!selectedExtension}
          extension={selectedExtension}
          onClose={() => setSelectedExtension(null)}
          onUpdate={loadExtensions}
        />
      )}
    </View>
  );
};

// Purchase Extension Tab Component
const PurchaseExtensionTab: React.FC<{
  ticket?: Ticket;
  navigation: any;
}> = ({ ticket, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const data = await ExtendedWarrantyService.getExtensionProviders();
      setProviders(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los proveedores');
    } finally {
      setLoading(false);
    }
  };

  if (!ticket) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="shield-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>Selecciona una garantía</Text>
        <Text style={styles.emptyText}>
          Para comprar una extensión, primero selecciona la garantía que deseas extender
        </Text>
      </View>
    );
  }

  const product = ticket.products[0];

  // Check eligibility
  const eligibility = ExtendedWarrantyService.isEligibleForExtension(
    ticket.purchaseDate,
    ticket.warrantyEndDate,
    product.category
  );

  if (!eligibility.eligible) {
    return (
      <View style={styles.ineligibleContainer}>
        <Ionicons name="close-circle" size={64} color="#f44336" />
        <Text style={styles.ineligibleTitle}>No elegible</Text>
        <Text style={styles.ineligibleText}>{eligibility.reason}</Text>
      </View>
    );
  }

  return (
    <View style={styles.purchaseContainer}>
      {/* Product Info */}
      <View style={styles.productCard}>
        <Ionicons name="cube-outline" size={32} color="#1a73e8" />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>
            Precio original: €{product.price?.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Providers */}
      <Text style={styles.sectionTitle}>Proveedores disponibles</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 24 }} />
      ) : (
        <View style={styles.providersList}>
          {providers.map((provider) => (
            <View key={provider.id} style={styles.providerCard}>
              <View style={styles.providerHeader}>
                <Text style={styles.providerCardName}>{provider.name}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color="#ff9800" />
                  <Text style={styles.ratingText}>
                    {provider.rating} ({provider.reviewCount})
                  </Text>
                </View>
              </View>

              <View style={styles.coverageList}>
                {provider.coverageTypes.map((coverage: string, index: number) => (
                  <View key={index} style={styles.coverageItem}>
                    <Ionicons name="checkmark-circle" size={14} color="#4caf50" />
                    <Text style={styles.coverageText}>{coverage}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.getQuoteButton}
                onPress={async () => {
                  Alert.alert(
                    'Obtener cotización',
                    `Obteniendo cotización de ${provider.name}...`,
                    [{ text: 'OK' }]
                  );
                }}
              >
                <Text style={styles.getQuoteButtonText}>Obtener cotización</Text>
                <Ionicons name="arrow-forward" size={18} color="#1a73e8" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// Extension Detail Modal
const ExtensionDetailModal: React.FC<{
  visible: boolean;
  extension: WarrantyExtension;
  onClose: () => void;
  onUpdate: () => void;
}> = ({ visible, extension, onClose, onUpdate }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalle de Extensión</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Policy Info */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Número de póliza</Text>
              <Text style={styles.detailValue}>{extension.policyNumber}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Proveedor</Text>
              <Text style={styles.detailValue}>{extension.provider}</Text>
            </View>

            {/* Coverage */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Cobertura</Text>
              {extension.coverage.map((item, index) => (
                <View key={index} style={styles.coverageDetailItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
                  <Text style={styles.coverageDetailText}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Contact */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Contacto</Text>
              <View style={styles.contactDetailRow}>
                <Ionicons name="call" size={16} color="#666" />
                <Text style={styles.contactDetailText}>{extension.contactPhone}</Text>
              </View>
              <View style={styles.contactDetailRow}>
                <Ionicons name="mail" size={16} color="#666" />
                <Text style={styles.contactDetailText}>{extension.contactEmail}</Text>
              </View>
            </View>

            {/* Terms */}
            {extension.terms && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Términos</Text>
                <Text style={styles.termsText}>{extension.terms}</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Alert.alert('Hacer reclamo', 'Funcionalidad de reclamo');
              }}
            >
              <Ionicons name="document-text" size={20} color="#1a73e8" />
              <Text style={styles.actionButtonText}>Hacer reclamo</Text>
            </TouchableOpacity>

            {extension.status === 'active' && (
              <TouchableOpacity
                style={[styles.actionButton, { borderColor: '#f44336' }]}
                onPress={async () => {
                  Alert.alert(
                    'Cancelar extensión',
                    'Recibirás un reembolso prorrateado. ¿Continuar?',
                    [
                      { text: 'No', style: 'cancel' },
                      {
                        text: 'Sí, cancelar',
                        style: 'destructive',
                        onPress: async () => {
                          const result = await ExtendedWarrantyService.cancelExtension(
                            extension.id,
                            'Usuario solicitó cancelación'
                          );
                          if (result.success) {
                            Alert.alert(
                              'Extensión cancelada',
                              `Reembolso: €${result.refundAmount?.toFixed(2)}`,
                              [{ text: 'OK', onPress: () => { onClose(); onUpdate(); } }]
                            );
                          }
                        }
                      }
                    ]
                  );
                }}
              >
                <Ionicons name="trash" size={20} color="#f44336" />
                <Text style={[styles.actionButtonText, { color: '#f44336' }]}>
                  Cancelar extensión
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabActive: {
    borderBottomColor: '#1a73e8'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  tabTextActive: {
    color: '#1a73e8'
  },
  content: {
    flex: 1
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20
  },
  emptyButton: {
    flexDirection: 'row',
    backgroundColor: '#1a73e8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff'
  },
  extensionsList: {
    padding: 16,
    gap: 12
  },
  extensionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  extensionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4
  },
  warningText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ff9800'
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a73e8'
  },
  policyRow: {
    flexDirection: 'row',
    marginBottom: 12
  },
  policyLabel: {
    fontSize: 13,
    color: '#666',
    marginRight: 6
  },
  policyNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
    fontFamily: 'monospace'
  },
  datesRow: {
    flexDirection: 'row',
    marginBottom: 12
  },
  dateItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  dateSeparator: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 12
  },
  dateLabel: {
    fontSize: 11,
    color: '#999'
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 12
  },
  costLabel: {
    fontSize: 14,
    color: '#666'
  },
  costValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4caf50'
  },
  claimsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8
  },
  claimsText: {
    fontSize: 12,
    color: '#666'
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12
  },
  infoContent: {
    flex: 1
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a73e8',
    marginBottom: 6
  },
  infoText: {
    fontSize: 13,
    color: '#1565c0',
    lineHeight: 18
  },
  ineligibleContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40
  },
  ineligibleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f44336',
    marginTop: 16,
    marginBottom: 8
  },
  ineligibleText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20
  },
  purchaseContainer: {
    padding: 16
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    gap: 12
  },
  productInfo: {
    flex: 1
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4
  },
  productPrice: {
    fontSize: 14,
    color: '#666'
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12
  },
  providersList: {
    gap: 12
  },
  providerCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  providerCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  ratingText: {
    fontSize: 13,
    color: '#666'
  },
  coverageList: {
    gap: 6,
    marginBottom: 12
  },
  coverageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  coverageText: {
    fontSize: 13,
    color: '#666'
  },
  getQuoteButton: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  getQuoteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a73e8'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  modalBody: {
    padding: 16
  },
  detailSection: {
    marginBottom: 20
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6
  },
  detailValue: {
    fontSize: 15,
    color: '#1a1a1a'
  },
  coverageDetailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 6
  },
  coverageDetailText: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 20
  },
  contactDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6
  },
  contactDetailText: {
    fontSize: 14,
    color: '#1a1a1a'
  },
  termsText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontStyle: 'italic'
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#1a73e8'
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a73e8'
  }
});
