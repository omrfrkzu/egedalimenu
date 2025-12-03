import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { promisify } from 'util'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Set timezone
process.env.TZ = 'Europe/Istanbul'

let db = null

/**
 * Initialize SQLite database
 */
export async function initDatabase() {
  if (db) return db

  const dbPath = path.join(__dirname, 'restaurant_pos.db')
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  })

  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON')
  
  // Set timezone (SQLite doesn't support timezone directly, but we'll handle it in application)
  console.log('✅ SQLite database connected successfully')
  console.log(`📁 Database path: ${dbPath}`)

  return db
}

/**
 * Get database instance
 */
export async function getDatabase() {
  if (!db) {
    await initDatabase()
  }
  return db
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  if (db) {
    await db.close()
    db = null
    console.log('✅ Database connection closed')
  }
}

export default {
  initDatabase,
  getDatabase,
  closeDatabase
}


