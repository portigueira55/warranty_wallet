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
import { FamilyGroupService } from '../services/familyGroupService';
import { FamilyGroup, FamilyMember, Ticket } from '../types';

interface FamilyGroupScreenProps {
  route: {
    params: {
      userId: string;
    };
  };
  navigation: any;
}

export const FamilyGroupScreen: React.FC<FamilyGroupScreenProps> = ({
  route,
  navigation
}) => {
  const { userId } = route.params;

  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<FamilyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<FamilyGroup | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const userGroups = await FamilyGroupService.getUserGroups(userId);
      setGroups(userGroups);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los grupos');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return 'crown';
      case 'admin': return 'shield-checkmark';
      default: return 'person';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return '#ff9800';
      case 'admin': return '#1a73e8';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text style={styles.loadingText}>Cargando grupos...</Text>
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
        <Text style={styles.headerTitle}>Grupos Familiares</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add-circle" size={28} color="#1a73e8" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No tienes grupos familiares</Text>
            <Text style={styles.emptyText}>
              Crea un grupo para compartir garantías con tu familia
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Crear Grupo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.groupsList}>
            {groups.map((group) => (
              <View key={group.id} style={styles.groupCard}>
                <TouchableOpacity
                  style={styles.groupHeader}
                  onPress={() => setSelectedGroup(selectedGroup?.id === group.id ? null : group)}
                >
                  <View style={styles.groupTitleContainer}>
                    <Ionicons name="people" size={24} color="#1a73e8" />
                    <View style={styles.groupTitleInfo}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      {group.description && (
                        <Text style={styles.groupDescription}>{group.description}</Text>
                      )}
                    </View>
                  </View>
                  <Ionicons
                    name={selectedGroup?.id === group.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>

                {selectedGroup?.id === group.id && (
                  <View style={styles.groupDetails}>
                    {/* Stats */}
                    <View style={styles.groupStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{group.members.length}</Text>
                        <Text style={styles.statLabel}>Miembros</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{group.sharedWarranties?.length || 0}</Text>
                        <Text style={styles.statLabel}>Garantías</Text>
                      </View>
                    </View>

                    {/* Members List */}
                    <View style={styles.membersSection}>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Miembros</Text>
                        {group.ownerId === userId && (
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedGroup(group);
                              setShowInviteModal(true);
                            }}
                          >
                            <Ionicons name="person-add" size={20} color="#1a73e8" />
                          </TouchableOpacity>
                        )}
                      </View>

                      {group.members.map((member) => (
                        <View key={member.userId} style={styles.memberCard}>
                          <View style={styles.memberAvatar}>
                            <Ionicons
                              name="person"
                              size={20}
                              color={getRoleColor(member.role)}
                            />
                          </View>
                          <View style={styles.memberInfo}>
                            <View style={styles.memberNameRow}>
                              <Text style={styles.memberName}>{member.name}</Text>
                              <View style={[
                                styles.roleBadge,
                                { backgroundColor: `${getRoleColor(member.role)}15` }
                              ]}>
                                <Ionicons
                                  name={getRoleIcon(member.role) as any}
                                  size={12}
                                  color={getRoleColor(member.role)}
                                />
                                <Text style={[
                                  styles.roleText,
                                  { color: getRoleColor(member.role) }
                                ]}>
                                  {member.role === 'owner' ? 'Propietario' :
                                    member.role === 'admin' ? 'Admin' : 'Miembro'}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.memberEmail}>{member.email}</Text>

                            {/* Permissions */}
                            <View style={styles.permissionsRow}>
                              {member.canViewWarranties && (
                                <View style={styles.permissionBadge}>
                                  <Ionicons name="eye" size={12} color="#4caf50" />
                                  <Text style={styles.permissionText}>Ver</Text>
                                </View>
                              )}
                              {member.canAddWarranties && (
                                <View style={styles.permissionBadge}>
                                  <Ionicons name="add-circle" size={12} color="#2196f3" />
                                  <Text style={styles.permissionText}>Agregar</Text>
                                </View>
                              )}
                              {member.canEditWarranties && (
                                <View style={styles.permissionBadge}>
                                  <Ionicons name="create" size={12} color="#ff9800" />
                                  <Text style={styles.permissionText}>Editar</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>

                    {/* Actions */}
                    <View style={styles.actionsSection}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          Alert.alert(
                            'Garantías compartidas',
                            'Ver garantías compartidas en este grupo'
                          );
                        }}
                      >
                        <Ionicons name="shield-checkmark-outline" size={18} color="#1a73e8" />
                        <Text style={styles.actionButtonText}>Ver garantías</Text>
                      </TouchableOpacity>

                      {group.ownerId === userId ? (
                        <TouchableOpacity
                          style={[styles.actionButton, { borderColor: '#f44336' }]}
                          onPress={() => {
                            Alert.alert(
                              'Eliminar grupo',
                              '¿Estás seguro de eliminar este grupo? Todas las garantías compartidas dejarán de estar disponibles para los miembros.',
                              [
                                { text: 'Cancelar', style: 'cancel' },
                                {
                                  text: 'Eliminar',
                                  style: 'destructive',
                                  onPress: async () => {
                                    const result = await FamilyGroupService.deleteGroup(group.id, userId);
                                    if (result.success) {
                                      loadGroups();
                                      setSelectedGroup(null);
                                    }
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Ionicons name="trash-outline" size={18} color="#f44336" />
                          <Text style={[styles.actionButtonText, { color: '#f44336' }]}>
                            Eliminar grupo
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[styles.actionButton, { borderColor: '#ff9800' }]}
                          onPress={() => {
                            Alert.alert(
                              'Salir del grupo',
                              '¿Estás seguro de salir de este grupo?',
                              [
                                { text: 'Cancelar', style: 'cancel' },
                                {
                                  text: 'Salir',
                                  style: 'destructive',
                                  onPress: async () => {
                                    const result = await FamilyGroupService.leaveGroup(group.id, userId);
                                    if (result.success) {
                                      loadGroups();
                                      setSelectedGroup(null);
                                    }
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Ionicons name="exit-outline" size={18} color="#ff9800" />
                          <Text style={[styles.actionButtonText, { color: '#ff9800' }]}>
                            Salir del grupo
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#1a73e8" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>¿Qué son los grupos familiares?</Text>
            <Text style={styles.infoText}>
              Comparte garantías con tu familia y gestionen juntos todos sus productos.
              Cada miembro puede tener diferentes permisos de acceso.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Create Group Modal */}
      <CreateGroupModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadGroups();
        }}
        userId={userId}
      />

      {/* Invite Member Modal */}
      {selectedGroup && (
        <InviteMemberModal
          visible={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            loadGroups();
          }}
          group={selectedGroup}
        />
      )}
    </View>
  );
};

// Create Group Modal
const CreateGroupModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}> = ({ visible, onClose, onSuccess, userId }) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Introduce un nombre para el grupo');
      return;
    }

    setCreating(true);
    try {
      await FamilyGroupService.createGroup(userId, groupName, description || undefined);
      Alert.alert('Grupo creado', 'El grupo se creó correctamente', [
        { text: 'OK', onPress: onSuccess }
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el grupo');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Crear Grupo Familiar</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.inputLabel}>Nombre del grupo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Familia García"
              value={groupName}
              onChangeText={setGroupName}
            />

            <Text style={styles.inputLabel}>Descripción (opcional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Ej: Garantías compartidas de la familia"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreate}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.createButtonText}>Crear Grupo</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Invite Member Modal
const InviteMemberModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  group: FamilyGroup;
}> = ({ visible, onClose, onSuccess, group }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [canView, setCanView] = useState(true);
  const [canAdd, setCanAdd] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Introduce un email');
      return;
    }

    setInviting(true);
    try {
      const result = await FamilyGroupService.inviteMember(
        group.id,
        email,
        role,
        { canViewWarranties: canView, canAddWarranties: canAdd, canEditWarranties: canEdit }
      );

      if (result.success) {
        Alert.alert('Invitación enviada', result.message, [
          { text: 'OK', onPress: onSuccess }
        ]);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la invitación');
    } finally {
      setInviting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Invitar Miembro</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>Email del usuario</Text>
            <TextInput
              style={styles.input}
              placeholder="usuario@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Rol</Text>
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[styles.roleOption, role === 'member' && styles.roleOptionSelected]}
                onPress={() => setRole('member')}
              >
                <Ionicons name="person" size={20} color={role === 'member' ? '#1a73e8' : '#666'} />
                <Text style={[
                  styles.roleOptionText,
                  role === 'member' && styles.roleOptionTextSelected
                ]}>
                  Miembro
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleOption, role === 'admin' && styles.roleOptionSelected]}
                onPress={() => setRole('admin')}
              >
                <Ionicons name="shield-checkmark" size={20} color={role === 'admin' ? '#1a73e8' : '#666'} />
                <Text style={[
                  styles.roleOptionText,
                  role === 'admin' && styles.roleOptionTextSelected
                ]}>
                  Administrador
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Permisos</Text>
            <View style={styles.permissionsSection}>
              <TouchableOpacity
                style={styles.permissionRow}
                onPress={() => setCanView(!canView)}
              >
                <Ionicons
                  name={canView ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={canView ? '#1a73e8' : '#999'}
                />
                <Text style={styles.permissionLabel}>Ver garantías</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.permissionRow}
                onPress={() => setCanAdd(!canAdd)}
              >
                <Ionicons
                  name={canAdd ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={canAdd ? '#1a73e8' : '#999'}
                />
                <Text style={styles.permissionLabel}>Agregar garantías</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.permissionRow}
                onPress={() => setCanEdit(!canEdit)}
              >
                <Ionicons
                  name={canEdit ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={canEdit ? '#1a73e8' : '#999'}
                />
                <Text style={styles.permissionLabel}>Editar garantías</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleInvite}
              disabled={inviting}
            >
              {inviting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.createButtonText}>Enviar Invitación</Text>
              )}
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
  groupsList: {
    padding: 16,
    gap: 12
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16
  },
  groupTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12
  },
  groupTitleInfo: {
    flex: 1
  },
  groupName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  groupDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2
  },
  groupDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 16
  },
  groupStats: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 16
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 12,
    borderRadius: 8
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a73e8',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#666'
  },
  membersSection: {
    marginBottom: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  memberCard: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  memberInfo: {
    flex: 1
  },
  memberNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600'
  },
  memberEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6
  },
  permissionsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap'
  },
  permissionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3
  },
  permissionText: {
    fontSize: 10,
    color: '#666'
  },
  actionsSection: {
    gap: 8
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#1a73e8'
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a73e8'
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
    marginBottom: 8,
    marginTop: 12
  },
  input: {
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a1a'
  },
  textArea: {
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1a1a1a',
    minHeight: 80
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 8
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f7fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  roleOptionSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1a73e8'
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  roleOptionTextSelected: {
    color: '#1a73e8'
  },
  permissionsSection: {
    gap: 12
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  permissionLabel: {
    fontSize: 15,
    color: '#1a1a1a'
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
  }
});
