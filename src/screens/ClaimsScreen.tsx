import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ClaimsService } from '../services/claimsService';
import { WarrantyClaim, Ticket } from '../types';

export const ClaimsScreen: React.FC<any> = ({
  route,
  navigation
}) => {
  const userId = route?.params?.userId || 'mock-user';
  const initialTicket = route?.params?.ticket;

  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<WarrantyClaim | null>(null);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const userClaims = await ClaimsService.getUserClaims(userId);
      setClaims(userClaims);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los reclamos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'approved': return '#4caf50';
      case 'in_progress': return '#2196f3';
      case 'resolved': return '#4caf50';
      case 'rejected': return '#f44336';
      default: return '#999';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobado';
      case 'in_progress': return 'En proceso';
      case 'resolved': return 'Resuelto';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'approved': return 'checkmark-circle';
      case 'in_progress': return 'sync-outline';
      case 'resolved': return 'checkmark-done-circle';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text style={styles.loadingText}>Cargando reclamos...</Text>
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
        <Text style={styles.headerTitle}>Reclamos de Garantía</Text>
        <TouchableOpacity onPress={() => setShowNewClaimModal(true)}>
          <Ionicons name="add-circle" size={28} color="#1a73e8" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
            <Text style={styles.statNumber}>
              {claims.filter(c => c.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
            <Text style={styles.statNumber}>
              {claims.filter(c => c.status === 'in_progress').length}
            </Text>
            <Text style={styles.statLabel}>En proceso</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
            <Text style={styles.statNumber}>
              {claims.filter(c => c.status === 'resolved').length}
            </Text>
            <Text style={styles.statLabel}>Resueltos</Text>
          </View>
        </View>

        {/* Claims List */}
        {claims.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No tienes reclamos</Text>
            <Text style={styles.emptyText}>
              Crea un reclamo para reportar problemas con tus productos
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowNewClaimModal(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Crear Reclamo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.claimsList}>
            {claims.map((claim) => (
              <TouchableOpacity
                key={claim.id}
                style={styles.claimCard}
                onPress={() => setSelectedClaim(claim)}
              >
                <View style={styles.claimHeader}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(claim.status)}15` }
                  ]}>
                    <Ionicons
                      name={getStatusIcon(claim.status) as any}
                      size={16}
                      color={getStatusColor(claim.status)}
                    />
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(claim.status) }
                    ]}>
                      {getStatusLabel(claim.status)}
                    </Text>
                  </View>
                  {claim.caseNumber && (
                    <Text style={styles.caseNumber}>#{claim.caseNumber}</Text>
                  )}
                </View>

                <Text style={styles.claimDescription} numberOfLines={2}>
                  {claim.issueDescription}
                </Text>

                <View style={styles.claimFooter}>
                  <View style={styles.claimDate}>
                    <Ionicons name="calendar-outline" size={14} color="#999" />
                    <Text style={styles.claimDateText}>
                      {new Date(claim.createdAt).toLocaleDateString('es-ES')}
                    </Text>
                  </View>

                  {claim.photos && claim.photos.length > 0 && (
                    <View style={styles.claimAttachments}>
                      <Ionicons name="image-outline" size={14} color="#666" />
                      <Text style={styles.claimAttachmentsText}>
                        {claim.photos.length}
                      </Text>
                    </View>
                  )}
                </View>

                {claim.manufacturerResponse && (
                  <View style={styles.responsePreview}>
                    <Ionicons name="chatbubble-ellipses-outline" size={14} color="#1a73e8" />
                    <Text style={styles.responsePreviewText} numberOfLines={1}>
                      {claim.manufacturerResponse}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* New Claim Modal */}
      {showNewClaimModal && (
        <NewClaimModal
          visible={showNewClaimModal}
          onClose={() => setShowNewClaimModal(false)}
          onSuccess={() => {
            setShowNewClaimModal(false);
            loadClaims();
          }}
          userId={userId}
          initialTicket={initialTicket}
        />
      )}

      {/* Claim Detail Modal */}
      {selectedClaim && (
        <ClaimDetailModal
          visible={!!selectedClaim}
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onUpdate={loadClaims}
        />
      )}
    </View>
  );
};

// New Claim Modal Component
const NewClaimModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  initialTicket?: Ticket;
}> = ({ visible, onClose, onSuccess, userId, initialTicket }) => {
  const [issueDescription, setIssueDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [showSATOptions, setShowSATOptions] = useState(false);
  const [createdClaim, setCreatedClaim] = useState<any>(null);

  const handleCreate = async () => {
    if (!issueDescription.trim()) {
      Alert.alert('Error', 'Describe el problema con el producto');
      return;
    }

    setCreating(true);
    try {
      const claim = await ClaimsService.createClaim(
        initialTicket?.id || 'ticket-1',
        initialTicket?.products[0]?.id || 'product-1',
        userId,
        issueDescription
      );

      setCreatedClaim(claim);
      setShowSATOptions(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el reclamo');
    } finally {
      setCreating(false);
    }
  };

  const handleSATOption = (option: string) => {
    Alert.alert(
      'Confirmación',
      `Has seleccionado: ${option}\n\nSe notificará al fabricante y recibirás instrucciones por email.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowSATOptions(false);
            onSuccess();
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {showSATOptions ? 'Opciones de Gestión' : 'Nueva Reclamación'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {!showSATOptions ? (
            <>
              <ScrollView style={styles.modalBody}>
                <Text style={styles.inputLabel}>Describe el problema</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Ej: La pantalla dejó de funcionar, el producto no enciende, etc."
                  value={issueDescription}
                  onChangeText={setIssueDescription}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />

                <TouchableOpacity style={styles.uploadButton}>
                  <Ionicons name="camera" size={20} color="#1a73e8" />
                  <Text style={styles.uploadButtonText}>Agregar fotos/videos</Text>
                </TouchableOpacity>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreate}
                  disabled={creating}
                >
                  {creating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.createButtonText}>Crear Reclamación</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <ScrollView style={styles.modalBody}>
                <View style={styles.successMessage}>
                  <Ionicons name="checkmark-circle" size={64} color="#4caf50" />
                  <Text style={styles.successTitle}>Reclamación creada</Text>
                  <Text style={styles.successText}>
                    Número de caso: {createdClaim?.caseNumber}
                  </Text>
                </View>

                <Text style={styles.satOptionsTitle}>¿Qué deseas hacer?</Text>

                <TouchableOpacity
                  style={styles.satOptionButton}
                  onPress={() => handleSATOption('Enviar a SAT')}
                >
                  <View style={[styles.satOptionIcon, { backgroundColor: '#e3f2fd' }]}>
                    <Ionicons name="send" size={24} color="#2196f3" />
                  </View>
                  <View style={styles.satOptionContent}>
                    <Text style={styles.satOptionTitle}>Enviar a SAT</Text>
                    <Text style={styles.satOptionDescription}>
                      El fabricante te enviará las instrucciones de envío
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.satOptionButton}
                  onPress={() => handleSATOption('Solicitar recogida')}
                >
                  <View style={[styles.satOptionIcon, { backgroundColor: '#fff3e0' }]}>
                    <Ionicons name="cube" size={24} color="#ff9800" />
                  </View>
                  <View style={styles.satOptionContent}>
                    <Text style={styles.satOptionTitle}>Solicitar recogida</Text>
                    <Text style={styles.satOptionDescription}>
                      El fabricante recogerá el producto en tu domicilio
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.satOptionButton}
                  onPress={() => handleSATOption('Avisar a SAT')}
                >
                  <View style={[styles.satOptionIcon, { backgroundColor: '#e8f5e9' }]}>
                    <Ionicons name="notifications" size={24} color="#4caf50" />
                  </View>
                  <View style={styles.satOptionContent}>
                    <Text style={styles.satOptionTitle}>Avisar a SAT</Text>
                    <Text style={styles.satOptionDescription}>
                      Notificar al servicio técnico del fabricante
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#999" />
                </TouchableOpacity>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setShowSATOptions(false);
                    onSuccess();
                  }}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Claim Detail Modal Component
const ClaimDetailModal: React.FC<{
  visible: boolean;
  claim: WarrantyClaim;
  onClose: () => void;
  onUpdate: () => void;
}> = ({ visible, claim, onClose, onUpdate }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'approved': return '#4caf50';
      case 'in_progress': return '#2196f3';
      case 'resolved': return '#4caf50';
      case 'rejected': return '#f44336';
      default: return '#999';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalle del Reclamo</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Case Number */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Número de caso</Text>
              <Text style={styles.detailValue}>{claim.caseNumber || 'N/A'}</Text>
            </View>

            {/* Status */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Estado</Text>
              <View style={[
                styles.detailStatusBadge,
                { backgroundColor: `${getStatusColor(claim.status)}15` }
              ]}>
                <Text style={[
                  styles.detailStatusText,
                  { color: getStatusColor(claim.status) }
                ]}>
                  {claim.status.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Descripción del problema</Text>
              <Text style={styles.detailDescription}>{claim.issueDescription}</Text>
            </View>

            {/* Dates */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Fecha de creación</Text>
              <Text style={styles.detailValue}>
                {new Date(claim.createdAt).toLocaleString('es-ES')}
              </Text>
            </View>

            {claim.resolvedAt && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Fecha de resolución</Text>
                <Text style={styles.detailValue}>
                  {new Date(claim.resolvedAt).toLocaleString('es-ES')}
                </Text>
              </View>
            )}

            {/* Manufacturer Response */}
            {claim.manufacturerResponse && (
              <View style={[styles.detailSection, styles.responseSection]}>
                <Text style={styles.detailLabel}>Respuesta del fabricante</Text>
                <Text style={styles.responseText}>{claim.manufacturerResponse}</Text>
              </View>
            )}

            {/* Photos */}
            {claim.photos && claim.photos.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Evidencia fotográfica</Text>
                <Text style={styles.detailValue}>{claim.photos.length} fotos adjuntas</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
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
  content: {
    flex: 1
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
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
  claimsList: {
    padding: 16,
    gap: 12
  },
  claimCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  claimHeader: {
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
    gap: 4
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  caseNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666'
  },
  claimDescription: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 20,
    marginBottom: 12
  },
  claimFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  claimDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  claimDateText: {
    fontSize: 12,
    color: '#999'
  },
  claimAttachments: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  claimAttachmentsText: {
    fontSize: 12,
    color: '#666'
  },
  responsePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 6
  },
  responsePreviewText: {
    flex: 1,
    fontSize: 13,
    color: '#1a73e8',
    fontStyle: 'italic'
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8
  },
  textArea: {
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1a1a1a',
    minHeight: 120,
    marginBottom: 16
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a73e8'
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  createButton: {
    backgroundColor: '#1a73e8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  closeButton: {
    backgroundColor: '#f5f7fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a'
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
  detailStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  detailStatusText: {
    fontSize: 13,
    fontWeight: '700'
  },
  detailDescription: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 22
  },
  responseSection: {
    backgroundColor: '#f5f7fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20
  },
  responseText: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 20,
    fontStyle: 'italic'
  },
  successMessage: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 24
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4caf50',
    marginTop: 16,
    marginBottom: 8
  },
  successText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600'
  },
  satOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16
  },
  satOptionButton: {
    flexDirection: 'row',
    backgroundColor: '#f5f7fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12
  },
  satOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  satOptionContent: {
    flex: 1
  },
  satOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4
  },
  satOptionDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18
  }
});
