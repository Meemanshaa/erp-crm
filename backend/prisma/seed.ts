import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const users = [
    { name: 'Admin User', email: 'admin@erp.test', role: Role.Admin },
    { name: 'Sales User', email: 'sales@erp.test', role: Role.Sales },
    { name: 'Warehouse User', email: 'warehouse@erp.test', role: Role.Warehouse },
    { name: 'Accounts User', email: 'accounts@erp.test', role: Role.Accounts },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, passwordHash },
    });
  }
  console.log('Seeded MySQL database with test accounts successfully!');
}

main().finally(() => prisma.$disconnect());