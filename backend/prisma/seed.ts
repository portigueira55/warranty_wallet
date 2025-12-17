import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  // Hash para passwords de prueba
  const passwordHash = await bcrypt.hash('password123', 10);

  // Crear super admin
  console.log('👤 Creando super admin...');
  const admin = await prisma.superAdmin.upsert({
    where: { email: 'admin@warrantywallet.com' },
    update: {},
    create: {
      email: 'admin@warrantywallet.com',
      passwordHash,
      name: 'Super Admin',
      role: 'admin',
    },
  });
  console.log(`✓ Admin creado: ${admin.email}`);

  // Crear fabricantes
  console.log('\n🏭 Creando fabricantes...');
  const manufacturers = await Promise.all([
    prisma.manufacturer.upsert({
      where: { email: 'contact@samsung.com' },
      update: {},
      create: {
        name: 'Samsung',
        email: 'contact@samsung.com',
        passwordHash,
        contactPhone: '+34 900 123 456',
        supportEmail: 'support@samsung.com',
        website: 'https://www.samsung.com',
      },
    }),
    prisma.manufacturer.upsert({
      where: { email: 'contact@lg.com' },
      update: {},
      create: {
        name: 'LG',
        email: 'contact@lg.com',
        passwordHash,
        contactPhone: '+34 900 654 321',
        supportEmail: 'support@lg.com',
        website: 'https://www.lg.com',
      },
    }),
    prisma.manufacturer.upsert({
      where: { email: 'contact@bosch.com' },
      update: {},
      create: {
        name: 'Bosch',
        email: 'contact@bosch.com',
        passwordHash,
        contactPhone: '+34 900 111 222',
        supportEmail: 'support@bosch.com',
        website: 'https://www.bosch.com',
      },
    }),
  ]);
  manufacturers.forEach(m => console.log(`✓ Fabricante: ${m.name}`));

  // Crear productos
  console.log('\n📦 Creando productos...');
  const products = await Promise.all([
    prisma.product.create({
      data: {
        manufacturerId: manufacturers[0].id,
        sku: 'SM-G998B',
        name: 'Samsung Galaxy S21 Ultra',
        category: 'Smartphones',
        defaultWarrantyMonths: 24,
      },
    }),
    prisma.product.create({
      data: {
        manufacturerId: manufacturers[0].id,
        sku: 'WW90T684DLN',
        name: 'Samsung Lavadora QuickDrive',
        category: 'Electrodomésticos',
        defaultWarrantyMonths: 36,
      },
    }),
    prisma.product.create({
      data: {
        manufacturerId: manufacturers[1].id,
        sku: 'OLED55C1',
        name: 'LG OLED TV 55"',
        category: 'Televisores',
        defaultWarrantyMonths: 24,
      },
    }),
    prisma.product.create({
      data: {
        manufacturerId: manufacturers[2].id,
        sku: 'SMV68TX06E',
        name: 'Bosch Lavavajillas',
        category: 'Electrodomésticos',
        defaultWarrantyMonths: 24,
      },
    }),
  ]);
  products.forEach(p => console.log(`✓ Producto: ${p.name}`));

  // Crear usuario de prueba
  console.log('\n👥 Creando usuario de prueba...');
  const user = await prisma.user.upsert({
    where: { email: 'demo@warrantywallet.com' },
    update: {},
    create: {
      email: 'demo@warrantywallet.com',
      passwordHash,
      username: 'Demo User',
      phone: '+34 600 000 000',
    },
  });
  console.log(`✓ Usuario: ${user.email}`);

  // Crear garantía de ejemplo
  console.log('\n📝 Creando garantía de ejemplo...');
  const warranty = await prisma.warranty.create({
    data: {
      userId: user.id,
      storeName: 'MediaMarkt Madrid',
      storeAddress: 'Calle Gran Vía, 28013 Madrid',
      ticketNumber: 'T-2024-00001',
      purchaseDate: new Date('2024-01-15'),
      totalAmount: 1299.99,
      items: {
        create: [
          {
            productId: products[0].id,
            sku: products[0].sku,
            name: products[0].name,
            quantity: 1,
            unitPrice: 1299.99,
            totalPrice: 1299.99,
            warrantyEndDate: new Date('2026-01-15'), // 2 años
          },
        ],
      },
    },
  });
  console.log(`✓ Garantía creada: ${warranty.ticketNumber}`);

  console.log('\n✅ Seed completado exitosamente!\n');
  console.log('📋 Credenciales de prueba:');
  console.log('   Super Admin: admin@warrantywallet.com / password123');
  console.log('   Usuario: demo@warrantywallet.com / password123');
  console.log('   Fabricante Samsung: contact@samsung.com / password123');
  console.log('   Fabricante LG: contact@lg.com / password123');
  console.log('   Fabricante Bosch: contact@bosch.com / password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
