import { PrismaClient } from '@prisma/client'
import { hashSync } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Find or create clinic
  let clinic = await prisma.clinic.findFirst({
    where: { name: 'Smith Dental Clinic' },
  })

  if (!clinic) {
    clinic = await prisma.clinic.create({
      data: {
        name: 'Smith Dental Clinic',
        address: '123 Main Street, New York, NY 10001',
        phone: '(555) 123-4567',
        email: 'info@smithdental.com',
      },
    })
    console.log('✅ Created clinic:', clinic.name)
  } else {
    console.log('✅ Using existing clinic:', clinic.name)
  }

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { email: 'admin@dental.com' },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'admin@dental.com',
        password: hashSync('dental123', 10),
        name: 'Dr. John Smith',
        role: 'ADMIN',
        clinicId: clinic.id,
      },
    })
    console.log('✅ Created user:', user.email)
  } else {
    console.log('✅ Using existing user:', user.email)
  }

  // Find or create demo user
  let demoUser = await prisma.user.findUnique({
    where: { email: 'test@demo.com' },
  })

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        email: 'test@demo.com',
        password: hashSync('demo@1234', 10),
        name: 'Demo User',
        role: 'ADMIN',
        clinicId: clinic.id,
      },
    })
    console.log('✅ Created demo user:', demoUser.email)
  } else {
    console.log('✅ Using existing demo user:', demoUser.email)
  }

  // Clear existing contacts for this clinic (optional - comment out to keep existing)
  const existingContactsCount = await prisma.contact.count({
    where: { clinicId: clinic.id },
  })
  
  if (existingContactsCount > 0) {
    console.log(`📋 Found ${existingContactsCount} existing contacts. Adding new contacts...`)
    // You can uncomment the line below to delete all contacts before seeding
    // await prisma.contact.deleteMany({ where: { clinicId: clinic.id } })
  }

  // Create contacts (specialists) - using createMany with skipDuplicates
  // Note: This won't skip duplicates based on name, so we check first
  const contacts = await prisma.contact.createMany({
    skipDuplicates: true, // Skip if there are any unique constraint conflicts
    data: [
      // Original contacts
      {
        clinicId: clinic.id,
        name: 'Dr. Sarah Johnson',
        specialty: 'Orthodontics',
        phone: '(555) 234-5678',
        email: 'sarah@orthodental.com',
        address: '456 Dental Ave, NYC',
        status: 'ACTIVE',
      },
      {
        clinicId: clinic.id,
        name: 'Dr. Michael Chen',
        specialty: 'Oral Surgery',
        phone: '(555) 345-6789',
        email: 'michael@oralsurgery.com',
        address: '789 Surgery Blvd, NYC',
        status: 'ACTIVE',
      },
      {
        clinicId: clinic.id,
        name: 'Dr. Emily Rodriguez',
        specialty: 'Periodontics',
        phone: '(555) 456-7890',
        email: 'emily@periodental.com',
        address: '321 Gum Street, NYC',
        status: 'ACTIVE',
      },
      {
        clinicId: clinic.id,
        name: 'Dr. James Wilson',
        specialty: 'Endodontics',
        phone: '(555) 567-8901',
        email: 'james@rootcanal.com',
        address: '654 Root Ave, NYC',
        status: 'ACTIVE',
      },
      // Additional dummy contacts
      {
        clinicId: clinic.id,
        name: 'Best Endodontics of Glenview',
        specialty: 'Endodontics',
        phone: '(847) 729-8400',
        email: 'info@bestendodontics.com',
        address: '123 Main St, Glenview, IL 60025',
        status: 'ACTIVE',
        notes: 'Specializing in root canal treatment',
      },
      {
        clinicId: clinic.id,
        name: 'Dr. M Rogers',
        specialty: 'Endodontics',
        phone: '(847) 729-8401',
        email: 'm.rogers@bestendodontics.com',
        address: '123 Main St, Glenview, IL 60025',
        status: 'ACTIVE',
      },
      {
        clinicId: clinic.id,
        name: 'Dr. P Erdle',
        specialty: 'Endodontics',
        phone: '(847) 729-8402',
        email: 'p.erdle@bestendodontics.com',
        address: '123 Main St, Glenview, IL 60025',
        status: 'ACTIVE',
      },
      {
        clinicId: clinic.id,
        name: 'Dr. T Rogers',
        specialty: 'Endodontics',
        phone: '(847) 729-8403',
        email: 't.rogers@bestendodontics.com',
        address: '123 Main St, Glenview, IL 60025',
        status: 'ACTIVE',
      },
      {
        clinicId: clinic.id,
        name: 'Karras, Louis G DDS',
        specialty: 'Oral Surgery',
        phone: '(773) 763-2000',
        email: 'l.karras@oralsurgery.com',
        address: '456 Medical Center Dr, Lincolnwood, IL 60646',
        status: 'ACTIVE',
        notes: 'Oral and maxillofacial surgery specialist',
      },
      {
        clinicId: clinic.id,
        name: 'Cameo Dental Specialists',
        specialty: 'Oral Surgery',
        phone: '(708) 456-7787',
        email: 'info@cameodental.com',
        address: '7603 North Ave, River Forest, IL 60305',
        status: 'ACTIVE',
        notes: 'Full service dental specialists',
      },
      {
        clinicId: clinic.id,
        name: 'Dr. J Chae',
        specialty: 'Oral Surgery',
        phone: '(708) 456-7788',
        email: 'j.chae@cameodental.com',
        address: '7603 North Ave, River Forest, IL 60305',
        status: 'ACTIVE',
      },
      {
        clinicId: clinic.id,
        name: 'Dr. K Quinlin',
        specialty: 'Oral Surgery',
        phone: '(708) 456-7789',
        email: 'k.quinlin@cameodental.com',
        address: '7603 North Ave, River Forest, IL 60305',
        status: 'ACTIVE',
      },
      {
        clinicId: clinic.id,
        name: 'Dr. L Allegretti',
        specialty: 'Oral Surgery',
        phone: '(708) 456-7790',
        email: 'l.allegretti@cameodental.com',
        address: '7603 North Ave, River Forest, IL 60305',
        status: 'ACTIVE',
      },
      {
        clinicId: clinic.id,
        name: 'Evaskus And Herzog, Ltd',
        specialty: 'Oral Surgery',
        phone: '(312) 555-0123',
        email: 'info@evaskusherzog.com',
        address: '789 Michigan Ave, Chicago, IL 60611',
        status: 'ACTIVE',
        notes: 'Advanced oral surgery practice',
      },
      {
        clinicId: clinic.id,
        name: 'Dr. Robert Martinez',
        specialty: 'Prosthodontics',
        phone: '(555) 678-9012',
        email: 'robert@prosthodontics.com',
        address: '987 Prosthetic Blvd, NYC',
        status: 'ACTIVE',
      },
      {
        clinicId: clinic.id,
        name: 'Dr. Jennifer Kim',
        specialty: 'Pediatric Dentistry',
        phone: '(555) 789-0123',
        email: 'jennifer@pediatricdental.com',
        address: '147 Kids Street, NYC',
        status: 'ACTIVE',
      },
      {
        clinicId: clinic.id,
        name: 'Dr. David Thompson',
        specialty: 'Oral Pathology',
        phone: '(555) 890-1234',
        email: 'david@oralpathology.com',
        address: '258 Pathology Way, NYC',
        status: 'ACTIVE',
      },
      {
        clinicId: clinic.id,
        name: 'Dr. Lisa Anderson',
        specialty: 'Orthodontics',
        phone: '(555) 901-2345',
        email: 'lisa@braces.com',
        address: '369 Ortho Lane, NYC',
        status: 'ACTIVE',
      },
      {
        clinicId: clinic.id,
        name: 'Dr. Mark Brown',
        specialty: 'Periodontics',
        phone: '(555) 012-3456',
        email: 'mark@perio.com',
        address: '741 Gum Road, NYC',
        status: 'ACTIVE',
      },
      {
        clinicId: clinic.id,
        name: 'Dr. Patricia White',
        specialty: 'Oral Surgery',
        phone: '(555) 123-4567',
        email: 'patricia@oralsurg.com',
        address: '852 Surgery Circle, NYC',
        status: 'ACTIVE',
      },
    ],
  })
  console.log('✅ Created contacts:', contacts.count)

  // Get contacts for referrals
  const contactList = await prisma.contact.findMany({
    where: { clinicId: clinic.id },
  })

  // Create outgoing referrals (you sent to specialists)
  const outgoingReferrals = []
  const now = new Date()
  
  for (let i = 0; i < 15; i++) {
    const contact = contactList[i % contactList.length]
    const daysAgo = Math.floor(Math.random() * 90) // Random date within last 90 days
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    
    outgoingReferrals.push({
      referralType: 'OUTGOING',
      fromClinicId: clinic.id,
      toContactId: contact.id,
      patientName: `Patient ${i + 1}`,
      patientDob: new Date(1970 + Math.floor(Math.random() * 40), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
      patientPhone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      patientEmail: `patient${i + 1}@email.com`,
      reason: `Needs ${contact.specialty.toLowerCase()} consultation`,
      urgency: ['ROUTINE', 'URGENT', 'EMERGENCY'][Math.floor(Math.random() * 3)] as any,
      status: ['SENT', 'ACCEPTED', 'COMPLETED'][Math.floor(Math.random() * 3)] as any,
      notes: `Referred for specialized treatment`,
      createdAt,
      updatedAt: createdAt,
    })
  }

  // Create incoming referrals (other clinics sent to you)
  const incomingReferrals = []
  
  for (let i = 0; i < 8; i++) {
    const daysAgo = Math.floor(Math.random() * 60)
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    
    incomingReferrals.push({
      referralType: 'INCOMING',
      fromClinicId: clinic.id, // Receiving clinic
      fromClinicName: `External Clinic ${i + 1}`,
      fromClinicEmail: `clinic${i + 1}@dental.com`,
      fromClinicPhone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      referringDentist: `Dr. External ${i + 1}`,
      patientName: `Referred Patient ${i + 1}`,
      patientDob: new Date(1970 + Math.floor(Math.random() * 40), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
      patientPhone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      reason: `Patient needs our specialized services`,
      urgency: ['ROUTINE', 'URGENT'][Math.floor(Math.random() * 2)] as any,
      status: ['SENT', 'ACCEPTED', 'COMPLETED'][Math.floor(Math.random() * 3)] as any,
      notes: `Incoming referral for review`,
      createdAt,
      updatedAt: createdAt,
    })
  }

  // Insert all referrals
  await prisma.referral.createMany({
    data: [...outgoingReferrals, ...incomingReferrals],
  })
  console.log('✅ Created referrals:', outgoingReferrals.length + incomingReferrals.length)

  // Create referral link for the clinic
  const slug = clinic.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  
  const referralLink = await prisma.clinicReferralLink.upsert({
    where: { clinicId: clinic.id },
    update: {
      slug,
      isActive: true,
    },
    create: {
      clinicId: clinic.id,
      slug,
      isActive: true,
    },
  })

  console.log('✅ Created/updated referral link:', referralLink.slug)

  console.log('🎉 Seed completed successfully!')
  console.log('\n📊 Database now contains:')
  console.log(`   - 1 clinic: ${clinic.name}`)
  console.log(`   - 1 user: ${user.email} (password: dental123)`)
  console.log(`   - 1 demo user: ${demoUser.email} (password: demo@1234)`)
  console.log(`   - ${contacts.count} contacts`)
  console.log(`   - ${outgoingReferrals.length} outgoing referrals`)
  console.log(`   - ${incomingReferrals.length} incoming referrals`)
  console.log(`   - Referral link: /refer/${referralLink.slug}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

