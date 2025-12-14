import { Ticket } from '../types';

/**
 * Servicio de datos MOCK que retorna datos de ejemplo sin guardarlos
 * Solución simple que SIEMPRE funciona
 */

const getDateAgo = (years: number, months: number = 0, days: number = 0): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  date.setMonth(date.getMonth() - months);
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

const calculateWarrantyEnd = (purchaseDate: string): string => {
  const date = new Date(purchaseDate);
  date.setFullYear(date.getFullYear() + 3);
  return date.toISOString();
};

const generateId = (): string => {
  return `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`;
};

/**
 * Retorna SIEMPRE los mismos 7 tickets de ejemplo
 * No intenta guardar nada - solo los retorna en memoria
 */
export const getMockTickets = (): Ticket[] => {
  const now = new Date().toISOString();
  const mockUserId = 'demo-user-id';
  const mockTenantId = 'demo-tenant';

  return [
    {
      id: generateId(),
      userId: mockUserId,
      tenantId: mockTenantId,
      imageUri: '',
      purchaseDate: getDateAgo(0, 2, 0),
      ticketNumber: '2024110156789',
      purchaseTime: '15:32',
      storeName: 'MediaMarkt',
      storeAddress: 'C/ Gran Vía 32, 28013 Madrid',
      products: [
        {
          id: generateId(),
          sku: 'SMGAL23U',
          name: 'Samsung Galaxy A23 Ultra 256GB',
          quantity: 1,
          unitPrice: 449.99,
          totalPrice: 449.99
        },
        {
          id: generateId(),
          sku: 'SAMCHG45',
          name: 'Cargador rápido Samsung 45W',
          quantity: 1,
          unitPrice: 29.99,
          totalPrice: 29.99
        }
      ],
      warrantyEndDate: calculateWarrantyEnd(getDateAgo(0, 2, 0)),
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      userId: mockUserId,
      tenantId: mockTenantId,
      imageUri: '',
      purchaseDate: getDateAgo(1, 1, 5),
      ticketNumber: '2023100234567',
      purchaseTime: '18:45',
      storeName: 'El Corte Inglés',
      storeAddress: 'C/ Preciados 3, 28013 Madrid',
      products: [
        {
          id: generateId(),
          sku: 'DELLXPS15',
          name: 'Dell XPS 15 i7 16GB 512GB SSD',
          quantity: 1,
          unitPrice: 1299.00,
          totalPrice: 1299.00
        },
        {
          id: generateId(),
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
    {
      id: generateId(),
      userId: mockUserId,
      tenantId: mockTenantId,
      imageUri: '',
      purchaseDate: getDateAgo(2, 9, 0),
      ticketNumber: '2022020198765',
      purchaseTime: '12:20',
      storeName: 'Fnac',
      storeAddress: 'C/ Raimundo Fernández Villaverde 79, 28003 Madrid',
      products: [
        {
          id: generateId(),
          sku: 'AIRPODSP',
          name: 'Apple AirPods Pro 2ª Gen',
          quantity: 1,
          unitPrice: 279.00,
          totalPrice: 279.00
        },
        {
          id: generateId(),
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
    {
      id: generateId(),
      userId: mockUserId,
      tenantId: mockTenantId,
      imageUri: '',
      purchaseDate: getDateAgo(2, 11, 15),
      ticketNumber: '2021121545678',
      purchaseTime: '10:15',
      storeName: 'Carrefour',
      storeAddress: 'Avda. de Monforte de Lemos 36, 28029 Madrid',
      products: [
        {
          id: generateId(),
          sku: 'LGOL55C2',
          name: 'LG OLED 55" C2 4K Smart TV',
          quantity: 1,
          unitPrice: 1199.00,
          totalPrice: 1199.00
        },
        {
          id: generateId(),
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
    {
      id: generateId(),
      userId: mockUserId,
      tenantId: mockTenantId,
      imageUri: '',
      purchaseDate: getDateAgo(3, 2, 10),
      ticketNumber: '2021091234567',
      purchaseTime: '14:50',
      storeName: 'PcComponentes',
      storeAddress: 'C/ Profesor Beltrán Báguena 5, 46009 Valencia',
      products: [
        {
          id: generateId(),
          sku: 'RTXGPU30',
          name: 'NVIDIA GeForce RTX 3080 10GB',
          quantity: 1,
          unitPrice: 799.00,
          totalPrice: 799.00
        },
        {
          id: generateId(),
          sku: 'AMD5800X',
          name: 'AMD Ryzen 7 5800X',
          quantity: 1,
          unitPrice: 399.00,
          totalPrice: 399.00
        }
      ],
      warrantyEndDate: calculateWarrantyEnd(getDateAgo(3, 2, 10)),
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      userId: mockUserId,
      tenantId: mockTenantId,
      imageUri: '',
      purchaseDate: getDateAgo(4, 0, 20),
      ticketNumber: '2020110987654',
      purchaseTime: '16:30',
      storeName: 'Worten',
      storeAddress: 'C/ Arturo Soria 126, 28043 Madrid',
      products: [
        {
          id: generateId(),
          sku: 'BOSEQC35',
          name: 'Bose QuietComfort 35 II',
          quantity: 1,
          unitPrice: 299.00,
          totalPrice: 299.00
        },
        {
          id: generateId(),
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
    {
      id: generateId(),
      userId: mockUserId,
      tenantId: mockTenantId,
      imageUri: '',
      purchaseDate: getDateAgo(0, 0, 15),
      ticketNumber: '2024112398765',
      purchaseTime: '09:45',
      storeName: 'Amazon España',
      storeAddress: 'Compra online',
      products: [
        {
          id: generateId(),
          sku: 'ECHO4TH',
          name: 'Amazon Echo (4ª gen)',
          quantity: 2,
          unitPrice: 99.99,
          totalPrice: 199.98
        },
        {
          id: generateId(),
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
