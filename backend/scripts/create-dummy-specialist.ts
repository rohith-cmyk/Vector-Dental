import { prisma } from '../src/config/database'
import { supabaseAdmin } from '../src/config/supabase'

const DUMMY_EMAIL = 'dummy.specialist@demo.com'
const DUMMY_PASSWORD = 'Demo12345!'
const DUMMY_NAME = 'Demo Specialist'
const DUMMY_CLINIC = 'Demo Specialist Clinic'

async function main() {
  console.log('Creating dummy specialist credentials...')

  const existing = await prisma.user.findUnique({
    where: { email: DUMMY_EMAIL },
    include: { clinic: true, specialistProfile: true },
  })

  if (existing) {
    console.log('✅ Dummy user already exists.')
    console.log(`Email: ${DUMMY_EMAIL}`)
    console.log(`Password: ${DUMMY_PASSWORD}`)
    console.log(`Clinic: ${existing.clinic.name}`)
    return
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: DUMMY_EMAIL,
    password: DUMMY_PASSWORD,
    email_confirm: true,
    user_metadata: {
      name: DUMMY_NAME,
      clinicName: DUMMY_CLINIC,
    },
  })

  if (authError || !authData.user) {
    throw new Error(`Supabase user create failed: ${authError?.message || 'Unknown error'}`)
  }

  const userId = authData.user.id

  const result = await prisma.$transaction(async (tx) => {
    const clinic = await tx.clinic.create({
      data: { name: DUMMY_CLINIC },
    })

    const user = await tx.user.create({
      data: {
        id: userId,
        email: DUMMY_EMAIL,
        password: '',
        name: DUMMY_NAME,
        role: 'ADMIN',
        clinicId: clinic.id,
      },
    })

    await tx.specialistProfile.create({
      data: {
        userId: user.id,
        clinicId: clinic.id,
        firstName: 'Demo',
        lastName: 'Specialist',
        credentials: 'DDS',
        specialty: 'Oral Surgery',
        subSpecialties: ['Implant Placement'],
        yearsInPractice: 8,
        boardCertified: true,
        languages: ['English'],
        insuranceAccepted: ['Delta Dental PPO'],
        phone: '(555) 555-0100',
        email: DUMMY_EMAIL,
        website: 'https://example.com',
        address: '123 Demo Lane',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
      },
    })

    return { clinic, user }
  })

  console.log('✅ Dummy specialist created.')
  console.log(`Email: ${DUMMY_EMAIL}`)
  console.log(`Password: ${DUMMY_PASSWORD}`)
  console.log(`Clinic: ${result.clinic.name}`)
}

main()
  .catch((error) => {
    console.error('❌ Failed to create dummy specialist:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
