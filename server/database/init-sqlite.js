import { initDatabase } from './db-sqlite.js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing SQLite database...')
    
    const db = await initDatabase()
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '001_create_orders_table_sqlite.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')
    
    // Execute migration
    await db.exec(migrationSQL)
    
    console.log('✅ Database initialized successfully!')
    console.log('📊 Orders table created')
    
    await db.close()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    process.exit(1)
  }
}

initializeDatabase()


