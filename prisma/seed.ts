import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const adminEmail = 'admin@cbdra.com'
  const adminPassword = 'Admin@123456'

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (existingAdmin) {
    console.log('✅ Admin user already exists')
  } else {
    // Hash the admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name: 'System Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
        phone: '+1-555-0100',
        address: 'CBDRA Headquarters',
        organization: 'CBDRA System',
        verified: true,
      }
    })

    console.log('✅ Admin user created successfully')
    console.log(`📧 Email: ${adminEmail}`)
    console.log(`🔑 Password: ${adminPassword}`)
    console.log(`👤 User ID: ${admin.id}`)
  }

  // Create sample community users for testing
  const communityUsers = [
    {
      name: 'John Community',
      email: 'john@community.com',
      password: 'Community@123',
      phone: '+1-555-0101',
      address: '123 Main St, Community City',
    },
    {
      name: 'Jane Resident',
      email: 'jane@resident.com',
      password: 'Resident@123',
      phone: '+1-555-0102',
      address: '456 Oak Ave, Community City',
    }
  ]

  for (const userData of communityUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 12)
      
      await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          role: UserRole.COMMUNITY_USER,
          verified: true,
        }
      })
      
      console.log(`✅ Community user created: ${userData.email}`)
    }
  }

  // Create sample volunteer, NGO, and government users
  const organizationUsers = [
    {
      name: 'Red Cross Volunteer',
      email: 'volunteer@redcross.org',
      password: 'Volunteer@123',
      role: UserRole.VOLUNTEER,
      organization: 'Red Cross',
      phone: '+1-555-0201',
      address: 'Red Cross Center',
    },
    {
      name: 'Emergency NGO',
      email: 'contact@emergencyngo.org',
      password: 'NGO@123456',
      role: UserRole.NGO,
      organization: 'Emergency Response NGO',
      phone: '+1-555-0301',
      address: 'NGO Headquarters',
    },
    {
      name: 'Government Agency',
      email: 'agency@government.gov',
      password: 'Gov@123456',
      role: UserRole.GOVERNMENT_AGENCY,
      organization: 'Emergency Management Agency',
      phone: '+1-555-0401',
      address: 'Government Building',
    }
  ]

  for (const userData of organizationUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 12)
      
      await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          verified: true,
        }
      })
      
      console.log(`✅ ${userData.role} user created: ${userData.email}`)
    }
  }

  console.log('🎉 Database seeding completed!')
  console.log('\n📋 Login Credentials:')
  console.log('Admin: admin@cbdra.com / Admin@123456')
  console.log('Community: john@community.com / Community@123')
  console.log('Community: jane@resident.com / Resident@123')
  console.log('Volunteer: volunteer@redcross.org / Volunteer@123')
  console.log('NGO: contact@emergencyngo.org / NGO@123456')
  console.log('Government: agency@government.gov / Gov@123456')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })