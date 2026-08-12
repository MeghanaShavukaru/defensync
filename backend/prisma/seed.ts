import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  await prisma.expenditure.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.equipmentType.deleteMany();
  await prisma.user.deleteMany();
  await prisma.base.deleteMany();

  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const passwordHashCommander = await bcrypt.hash('Commander@123', 10);
  const passwordHashLogistics = await bcrypt.hash('Logistics@123', 10);
  const passwordHashAuditor = await bcrypt.hash('Auditor@123', 10);

  const fortAlpha = await prisma.base.create({
    data: {
      code: 'FORT_ALPHA',
      name: 'Fort Alpha',
      location: 'Northern Training Zone',
      description: 'Primary training and logistics base for demonstration operations.',
      status: 'ACTIVE',
    },
  });

  const fortBravo = await prisma.base.create({
    data: {
      code: 'FORT_BRAVO',
      name: 'Fort Bravo',
      location: 'Eastern Support Range',
      description: 'Secondary base supporting asset staging and equipment readiness.',
      status: 'ACTIVE',
    },
  });

  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'Demo',
      email: 'admin@defensync.demo',
      username: 'admin',
      password: passwordHash,
      role: 'ADMIN',
      active: true,
    },
  });

  const commander = await prisma.user.create({
    data: {
      firstName: 'Commander',
      lastName: 'Alpha',
      email: 'commander.alpha@defensync.demo',
      username: 'commander.alpha',
      password: passwordHashCommander,
      role: 'BASE_COMMANDER',
      baseId: fortAlpha.id,
      active: true,
    },
  });

  const logistics = await prisma.user.create({
    data: {
      firstName: 'Logistics',
      lastName: 'Alpha',
      email: 'logistics.alpha@defensync.demo',
      username: 'logistics.alpha',
      password: passwordHashLogistics,
      role: 'LOGISTICS_OFFICER',
      baseId: fortAlpha.id,
      active: true,
    },
  });

  const auditor = await prisma.user.create({
    data: {
      firstName: 'Auditor',
      lastName: 'Demo',
      email: 'auditor@defensync.demo',
      username: 'auditor',
      password: passwordHashAuditor,
      role: 'AUDITOR',
      active: true,
    },
  });

  await prisma.equipmentType.createMany({
    data: [
      {
        name: 'Utility Vehicle',
        code: 'UTV-01',
        category: 'VEHICLE',
        description: 'Light transport vehicle used for base logistics and movements.',
        unitOfMeasure: 'unit',
        minimumStock: 2,
        criticalStock: 1,
        individuallyTracked: true,
      },
      {
        name: 'Training Rifle',
        code: 'WRF-01',
        category: 'WEAPON',
        description: 'Standard training rifle for drill exercises.',
        unitOfMeasure: 'unit',
        minimumStock: 10,
        criticalStock: 5,
        individuallyTracked: true,
      },
      {
        name: 'Training Ammunition',
        code: 'AMM-01',
        category: 'AMMUNITION',
        description: 'Practice ammunition for training ranges.',
        unitOfMeasure: 'round',
        minimumStock: 500,
        criticalStock: 200,
        individuallyTracked: false,
      },
      {
        name: 'Radio Set',
        code: 'COM-01',
        category: 'COMMUNICATION',
        description: 'Portable radio communications set.',
        unitOfMeasure: 'unit',
        minimumStock: 5,
        criticalStock: 2,
        individuallyTracked: true,
      },
      {
        name: 'Medical Kit',
        code: 'MED-01',
        category: 'MEDICAL',
        description: 'Basic field medical response kit.',
        unitOfMeasure: 'kit',
        minimumStock: 8,
        criticalStock: 4,
        individuallyTracked: false,
      },
    ],
  });

  // Load equipment types back (create individually so we have IDs)
  const utv = await prisma.equipmentType.upsert({
    where: { code: 'UTV-01' },
    update: {},
    create: {
      name: 'Utility Vehicle',
      code: 'UTV-01',
      category: 'VEHICLE',
      description: 'Light transport vehicle used for base logistics and movements.',
      unitOfMeasure: 'unit',
      minimumStock: 2,
      criticalStock: 1,
      individuallyTracked: true,
    },
  });

  const rifle = await prisma.equipmentType.upsert({
    where: { code: 'WRF-01' },
    update: {},
    create: {
      name: 'Training Rifle',
      code: 'WRF-01',
      category: 'WEAPON',
      description: 'Standard training rifle for drill exercises.',
      unitOfMeasure: 'unit',
      minimumStock: 10,
      criticalStock: 5,
      individuallyTracked: true,
    },
  });

  const ammo = await prisma.equipmentType.upsert({
    where: { code: 'AMM-01' },
    update: {},
    create: {
      name: 'Training Ammunition',
      code: 'AMM-01',
      category: 'AMMUNITION',
      description: 'Practice ammunition for training ranges.',
      unitOfMeasure: 'round',
      minimumStock: 500,
      criticalStock: 200,
      individuallyTracked: false,
    },
  });

  const radio = await prisma.equipmentType.upsert({
    where: { code: 'COM-01' },
    update: {},
    create: {
      name: 'Radio Set',
      code: 'COM-01',
      category: 'COMMUNICATION',
      description: 'Portable radio communications set.',
      unitOfMeasure: 'unit',
      minimumStock: 5,
      criticalStock: 2,
      individuallyTracked: true,
    },
  });

  const medkit = await prisma.equipmentType.upsert({
    where: { code: 'MED-01' },
    update: {},
    create: {
      name: 'Medical Kit',
      code: 'MED-01',
      category: 'MEDICAL',
      description: 'Basic field medical response kit.',
      unitOfMeasure: 'kit',
      minimumStock: 8,
      criticalStock: 4,
      individuallyTracked: false,
    },
  });

  // Create some assets
  const asset1 = await prisma.asset.create({
    data: {
      assetCode: 'UTV-001',
      equipmentTypeId: utv.id,
      baseId: fortAlpha.id,
      serialNumber: 'UTV-ALPHA-001',
      quantity: 3,
      available: 3,
      acquisitionDate: new Date('2025-01-15'),
    },
  });

  const asset2 = await prisma.asset.create({
    data: {
      assetCode: 'WRF-ALPHA-001',
      equipmentTypeId: rifle.id,
      baseId: fortAlpha.id,
      serialNumber: 'RIFLE-ALPHA-001',
      quantity: 10,
      available: 10,
      acquisitionDate: new Date('2024-08-01'),
    },
  });

  const asset3 = await prisma.asset.create({
    data: {
      assetCode: 'AMM-ALPHA-001',
      equipmentTypeId: ammo.id,
      baseId: fortAlpha.id,
      quantity: 1000,
      available: 1000,
      acquisitionDate: new Date('2026-02-10'),
    },
  });

  // Supplier and a purchase
  const supplier = await prisma.supplier.create({
    data: {
      supplierCode: 'SUP-001',
      name: 'Demo Supplies Ltd',
      contactPerson: 'Jane Doe',
      email: 'jane@demosupplies.local',
      phone: '+1000000000',
      address: '123 Supply Rd',
      status: 'ACTIVE',
    },
  });

  const purchase = await prisma.purchase.create({
    data: {
      purchaseNumber: 'PUR-001',
      baseId: fortAlpha.id,
      equipmentTypeId: ammo.id,
      quantity: 500,
      unitCost: 0.5,
      totalCost: 250,
      supplierId: supplier.id,
      purchaseDate: new Date(),
      status: 'RECEIVED',
      createdById: admin.id,
    },
  });

  // Create a transfer
  const transfer = await prisma.transfer.create({
    data: {
      transferNumber: 'TRF-001',
      sourceBaseId: fortAlpha.id,
      destinationBaseId: fortBravo.id,
      equipmentTypeId: rifle.id,
      quantity: 5,
      reason: 'Support training rotation',
      priority: 'NORMAL',
      requestedById: logistics.id,
      requestedAt: new Date(),
      status: 'REQUESTED',
    },
  });

  // Assignment
  const assignment = await prisma.assignment.create({
    data: {
      assignmentNumber: 'ASN-001',
      assetId: asset2.id,
      quantity: 2,
      baseId: fortAlpha.id,
      assigneeName: 'Alpha Company',
      unit: 'Platoon',
      purpose: 'Field exercise',
      assignedDate: new Date(),
      expectedReturn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      assignedById: logistics.id,
      status: 'ACTIVE',
    },
  });

  // Expenditure
  const expenditure = await prisma.expenditure.create({
    data: {
      expenditureNumber: 'EXP-001',
      baseId: fortAlpha.id,
      equipmentTypeId: medkit.id,
      quantity: 5,
      category: 'SUPPLIES',
      activityReference: 'Field Med Support',
      expenditureDate: new Date(),
      createdById: logistics.id,
      notes: 'Restocked basic kits for exercise',
    },
  });

  // Maintenance record
  const maintenance = await prisma.maintenanceRecord.create({
    data: {
      maintenanceId: 'MTN-001',
      assetId: asset1.id,
      maintenanceType: 'SCHEDULED_SERVICE',
      issue: 'Oil change and inspection',
      startDate: new Date(),
      expectedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'SCHEDULED',
    },
  });

  // Notification and audit log
  await prisma.notification.create({
    data: {
      userId: commander.id,
      type: 'INFO',
      message: 'Demo seed completed and demo records created.',
      relatedEntity: 'Purchase',
      relatedId: purchase.id,
      status: 'UNREAD',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'CREATE_PURCHASE',
      entityType: 'Purchase',
      entityId: purchase.id,
      description: 'Seeded initial purchase',
    },
  });

  console.log('Seed completed with demo assets, purchases, transfers, and records.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
