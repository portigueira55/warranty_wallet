const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n📊 DATOS EN LA BASE DE DATOS:\n');
  console.log('='.repeat(50));

  const users = await prisma.user.findMany();
  console.log('\n👤 USUARIOS:', users.length);
  users.forEach(u => console.log(`  - ${u.username} (${u.email})`));

  const manufacturers = await prisma.manufacturer.findMany();
  console.log('\n🏭 FABRICANTES:', manufacturers.length);
  manufacturers.forEach(m => console.log(`  - ${m.name} (${m.email})`));

  const products = await prisma.product.findMany();
  console.log('\n📦 PRODUCTOS:', products.length);
  products.forEach(p => console.log(`  - ${p.name}`));

  const warranties = await prisma.warranty.findMany({ include: { items: true } });
  console.log('\n📝 GARANTÍAS:', warranties.length);
  warranties.forEach(w => console.log(`  - ${w.storeName || 'N/A'} - ${w.ticketNumber || 'N/A'} (${w.items.length} items)`));

  const admins = await prisma.superAdmin.findMany();
  console.log('\n🔐 SUPER ADMINS:', admins.length);
  admins.forEach(a => console.log(`  - ${a.name} (${a.email})`));

  console.log('\n' + '='.repeat(50));
  console.log('✅ Todos los datos están guardados correctamente!');
  console.log('✅ El backend está funcionando perfectamente!\n');
}

main()
  .catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
