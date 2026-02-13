import { supabaseAdmin } from '../src/config/supabase'

const DUMMY_EMAIL = 'dummy.specialist@demo.com'
const DUMMY_PASSWORD = 'Demo12345!'

async function main() {
  console.log('Resetting dummy specialist password...')

  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const user = users?.users?.find((u) => u.email === DUMMY_EMAIL)

  if (!user) {
    console.log('User not found in Supabase. Run: npm run create-dummy-specialist')
    return
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password: DUMMY_PASSWORD,
  })

  if (error) {
    throw new Error(`Password reset failed: ${error.message}`)
  }

  console.log('✅ Password reset successfully.')
  console.log(`Email: ${DUMMY_EMAIL}`)
  console.log(`Password: ${DUMMY_PASSWORD}`)
}

main()
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })
