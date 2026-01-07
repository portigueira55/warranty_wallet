import Dexie, { Table } from 'dexie';
import type { Warranty, User, Notification } from '../types';

export interface SyncQueue {
  id?: number;
  type: 'create' | 'update' | 'delete';
  entity: 'warranty' | 'notification';
  data: any;
  timestamp: number;
  synced: boolean;
}

class WarrantyWalletDB extends Dexie {
  warranties!: Table<Warranty>;
  notifications!: Table<Notification>;
  user!: Table<User>;
  syncQueue!: Table<SyncQueue>;

  constructor() {
    super('WarrantyWalletDB');

    this.version(1).stores({
      warranties: '++id, user_id, status, category, expiry_date, created_at',
      notifications: '++id, user_id, read, type, created_at',
      user: '++id, email',
      syncQueue: '++id, synced, timestamp',
    });
  }
}

export const db = new WarrantyWalletDB();

// Sync functions
export async function addToSyncQueue(
  type: SyncQueue['type'],
  entity: SyncQueue['entity'],
  data: any
) {
  await db.syncQueue.add({
    type,
    entity,
    data,
    timestamp: Date.now(),
    synced: false,
  });
}

export async function getSyncQueue() {
  return await db.syncQueue.where('synced').equals(0).toArray();
}

export async function markAsSynced(id: number) {
  await db.syncQueue.update(id, { synced: true });
}

export async function clearSyncedQueue() {
  await db.syncQueue.where('synced').equals(1).delete();
}

// Offline warranty operations
export async function saveWarrantyOffline(warranty: Warranty) {
  const id = await db.warranties.put(warranty);
  await addToSyncQueue('create', 'warranty', warranty);
  return id;
}

export async function updateWarrantyOffline(id: number, updates: Partial<Warranty>) {
  await db.warranties.update(id, updates);
  await addToSyncQueue('update', 'warranty', { id, ...updates });
}

export async function deleteWarrantyOffline(id: number) {
  await db.warranties.delete(id);
  await addToSyncQueue('delete', 'warranty', { id });
}

export async function getWarrantiesOffline() {
  return await db.warranties.toArray();
}

// Cache warranties from API
export async function cacheWarranties(warranties: Warranty[]) {
  await db.warranties.clear();
  await db.warranties.bulkAdd(warranties);
}

// Cache notifications from API
export async function cacheNotifications(notifications: Notification[]) {
  await db.notifications.clear();
  await db.notifications.bulkAdd(notifications);
}

export async function getNotificationsOffline() {
  return await db.notifications.toArray();
}

// Check online status
export function isOnline(): boolean {
  return navigator.onLine;
}

// Sync when online
export async function syncWithServer() {
  if (!isOnline()) {
    console.log('Offline: Sync deferred');
    return;
  }

  const queue = await getSyncQueue();
  console.log(`Syncing ${queue.length} items...`);

  for (const item of queue) {
    try {
      // Here you would call the actual API
      // For now, we just mark as synced
      await markAsSynced(item.id!);
      console.log(`Synced: ${item.type} ${item.entity}`);
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  await clearSyncedQueue();
}

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Back online! Syncing...');
    syncWithServer();
  });

  window.addEventListener('offline', () => {
    console.log('Offline mode activated');
  });
}
