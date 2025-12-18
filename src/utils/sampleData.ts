import { Ticket, Product } from '../types';
import { generateUniqueId } from './encryption';

/**
 * Genera datos de ejemplo para demostración
 * Incluye productos con diferentes estados de garantía
 */

/**
 * Calcula fecha hacia atrás desde hoy
 */
const getDateAgo = (years: number, months: number = 0, days: number = 0): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  date.setMonth(date.getMonth() - months);
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

/**
 * Calcula fecha de fin de garantía (3 años desde compra)
 */
const calculateWarrantyEnd = (purchaseDate: string): string => {
  const date = new Date(purchaseDate);
  date.setFullYear(date.getFullYear() + 3);
  return date.toISOString();
};

/**
 * Genera tickets de ejemplo con diferentes estados de garantía
 */
export const generateSampleTickets = (userId: string, tenantId: string): Ticket[] => {
  const now = new Date().toISOString();

  return [
    // Ticket 1: Garantía vigente - comprado hace 2 meses
    {
      id: generateUniqueId(),
      userId,
      tenantId,
      imageUri: 'https://via.placeholder.com/400x600/4CAF50/FFFFFF/?text=Ticket+MediaMarkt',
      purchaseDate: getDateAgo(0, 2, 0),
      ticketNumber: '2024110156789',
      purchaseTime: '15:32',
      storeName: 'MediaMarkt',
      storeAddress: 'C/ Gran Vía 32, 28013 Madrid',
      products: [
        {
          id: generateUniqueId(),
          sku: 'SMGAL23U',
          name: 'Samsung Galaxy A23 Ultra 256GB',
          quantity: 1,
          unitPrice: 449.99,
          totalPrice: 449.99
        },
        {
          id: generateUniqueId(),
          sku: 'SAMCHG45',
          name: 'Cargador rápido Samsung 45W',
          quantity: 1,
          unitPrice: 29.99,
          totalPrice: 29.99
        },
        {
          id: generateUniqueId(),
          sku: 'CASEGEL',
          name: 'Funda de gel transparente',
          quantity: 2,
          unitPrice: 9.99,
          totalPrice: 19.98
        }
      ],
      warrantyEndDate: calculateWarrantyEnd(getDateAgo(0, 2, 0)),
      createdAt: now,
      updatedAt: now
    },

    // Ticket 2: Garantía vigente - comprado hace 1 año
    {
      id: generateUniqueId(),
      userId,
      tenantId,
      imageUri: 'https://via.placeholder.com/400x600/2196F3/FFFFFF/?text=Ticket+El+Corte+Ingles',
      purchaseDate: getDateAgo(1, 1, 5),
      ticketNumber: '2023100234567',
      purchaseTime: '18:45',
      storeName: 'El Corte Inglés',
      storeAddress: 'C/ Preciados 3, 28013 Madrid',
      products: [
        {
          id: generateUniqueId(),
          sku: 'DELLXPS15',
          name: 'Dell XPS 15 i7 16GB 512GB SSD',
          quantity: 1,
          unitPrice: 1299.00,
          totalPrice: 1299.00
        },
        {
          id: generateUniqueId(),
          sku: 'LOGIMX3',
          name: 'Ratón Logitech MX Master 3',
          quantity: 1,
          unitPrice: 99.99,
          totalPrice: 99.99
        }
      ],
      warrantyEndDate: calculateWarrantyEnd(getDateAgo(1, 1, 5)),
      createdAt: now,
      updatedAt: now
    },

    // Ticket 3: Garantía próxima a vencer - comprado hace 2 años y 9 meses
    {
      id: generateUniqueId(),
      userId,
      tenantId,
      imageUri: 'https://via.placeholder.com/400x600/FF9800/FFFFFF/?text=Ticket+Fnac',
      purchaseDate: getDateAgo(2, 9, 0),
      ticketNumber: '2022020198765',
      purchaseTime: '12:20',
      storeName: 'Fnac',
      storeAddress: 'C/ Raimundo Fernández Villaverde 79, 28003 Madrid',
      products: [
        {
          id: generateUniqueId(),
          sku: 'AIRPODSP',
          name: 'Apple AirPods Pro 2ª Gen',
          quantity: 1,
          unitPrice: 279.00,
          totalPrice: 279.00
        },
        {
          id: generateUniqueId(),
          sku: 'IPADAIR',
          name: 'iPad Air 64GB WiFi',
          quantity: 1,
          unitPrice: 649.00,
          totalPrice: 649.00
        }
      ],
      warrantyEndDate: calculateWarrantyEnd(getDateAgo(2, 9, 0)),
      createdAt: now,
      updatedAt: now
    },

    // Ticket 4: Garantía próxima a vencer - comprado hace 2 años y 11 meses
    {
      id: generateUniqueId(),
      userId,
      tenantId,
      imageUri: 'https://via.placeholder.com/400x600/FFC107/FFFFFF/?text=Ticket+Carrefour',
      purchaseDate: getDateAgo(2, 11, 15),
      ticketNumber: '2021121545678',
      purchaseTime: '10:15',
      storeName: 'Carrefour',
      storeAddress: 'Avda. de Monforte de Lemos 36, 28029 Madrid',
      products: [
        {
          id: generateUniqueId(),
          sku: 'LGOL55C2',
          name: 'LG OLED 55" C2 4K Smart TV',
          quantity: 1,
          unitPrice: 1199.00,
          totalPrice: 1199.00
        },
        {
          id: generateUniqueId(),
          sku: 'SAMSNDBAR',
          name: 'Samsung Soundbar HW-Q700A',
          quantity: 1,
          unitPrice: 449.00,
          totalPrice: 449.00
        }
      ],
      warrantyEndDate: calculateWarrantyEnd(getDateAgo(2, 11, 15)),
      createdAt: now,
      updatedAt: now
    },

    // Ticket 5: Garantía VENCIDA - comprado hace 3 años y 2 meses
    {
      id: generateUniqueId(),
      userId,
      tenantId,
      imageUri: 'https://via.placeholder.com/400x600/F44336/FFFFFF/?text=Ticket+PcComponentes',
      purchaseDate: getDateAgo(3, 2, 10),
      ticketNumber: '2021091234567',
      purchaseTime: '14:50',
      storeName: 'PcComponentes',
      storeAddress: 'C/ Profesor Beltrán Báguena 5, 46009 Valencia',
      products: [
        {
          id: generateUniqueId(),
          sku: 'RTXGPU30',
          name: 'NVIDIA GeForce RTX 3080 10GB',
          quantity: 1,
          unitPrice: 799.00,
          totalPrice: 799.00
        },
        {
          id: generateUniqueId(),
          sku: 'AMD5800X',
          name: 'AMD Ryzen 7 5800X',
          quantity: 1,
          unitPrice: 399.00,
          totalPrice: 399.00
        },
        {
          id: generateUniqueId(),
          sku: 'CORSAIRRAM',
          name: 'Corsair Vengeance 32GB DDR4',
          quantity: 2,
          unitPrice: 129.99,
          totalPrice: 259.98
        }
      ],
      warrantyEndDate: calculateWarrantyEnd(getDateAgo(3, 2, 10)),
      createdAt: now,
      updatedAt: now
    },

    // Ticket 6: Garantía VENCIDA - comprado hace 4 años
    {
      id: generateUniqueId(),
      userId,
      tenantId,
      imageUri: 'https://via.placeholder.com/400x600/9C27B0/FFFFFF/?text=Ticket+Worten',
      purchaseDate: getDateAgo(4, 0, 20),
      ticketNumber: '2020110987654',
      purchaseTime: '16:30',
      storeName: 'Worten',
      storeAddress: 'C/ Arturo Soria 126, 28043 Madrid',
      products: [
        {
          id: generateUniqueId(),
          sku: 'BOSEQC35',
          name: 'Bose QuietComfort 35 II',
          quantity: 1,
          unitPrice: 299.00,
          totalPrice: 299.00
        },
        {
          id: generateUniqueId(),
          sku: 'KINDLEPW',
          name: 'Kindle Paperwhite 8GB',
          quantity: 1,
          unitPrice: 129.99,
          totalPrice: 129.99
        }
      ],
      warrantyEndDate: calculateWarrantyEnd(getDateAgo(4, 0, 20)),
      createdAt: now,
      updatedAt: now
    },

    // Ticket 7: Garantía reciente - comprado hace 15 días
    {
      id: generateUniqueId(),
      userId,
      tenantId,
      imageUri: 'https://via.placeholder.com/400x600/00BCD4/FFFFFF/?text=Ticket+Amazon',
      purchaseDate: getDateAgo(0, 0, 15),
      ticketNumber: '2024112398765',
      purchaseTime: '09:45',
      storeName: 'Amazon España',
      storeAddress: 'Compra online',
      products: [
        {
          id: generateUniqueId(),
          sku: 'ECHO4TH',
          name: 'Amazon Echo (4ª gen)',
          quantity: 2,
          unitPrice: 99.99,
          totalPrice: 199.98
        },
        {
          id: generateUniqueId(),
          sku: 'FIRETV4K',
          name: 'Fire TV Stick 4K',
          quantity: 1,
          unitPrice: 59.99,
          totalPrice: 59.99
        }
      ],
      warrantyEndDate: calculateWarrantyEnd(getDateAgo(0, 0, 15)),
      createdAt: now,
      updatedAt: now
    }
  ];
};

/**
 * Carga los datos de ejemplo en el storage
 */
export const loadSampleData = async (userId: string, tenantId: string): Promise<void> => {
  try {
    console.log('📦 Iniciando carga de datos de ejemplo...');
    console.log('👤 Usuario:', userId);
    console.log('🏢 Tenant:', tenantId);

    if (!userId || !tenantId) {
      throw new Error('Se requieren userId y tenantId para cargar datos de ejemplo');
    }

    const { TicketStorage } = await import('../services/storage');

    const sampleTickets = generateSampleTickets(userId, tenantId);
    console.log(`📝 Generados ${sampleTickets.length} tickets de ejemplo`);

    for (let i = 0; i < sampleTickets.length; i++) {
      const ticket = sampleTickets[i];
      console.log(`💾 Guardando ticket ${i + 1}/${sampleTickets.length}: ${ticket.storeName}`);
      await TicketStorage.saveTicket(ticket);
    }

    console.log(`✅ ${sampleTickets.length} tickets de ejemplo cargados correctamente`);
  } catch (error) {
    console.error('❌ Error cargando datos de ejemplo:', error);
    throw error;
  }
};
