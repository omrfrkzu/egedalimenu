import dotenv from 'dotenv'

dotenv.config()

// Set timezone
process.env.TZ = 'Europe/Istanbul'

// Check which database to use
const DB_TYPE = process.env.DB_TYPE || 'sqlite' // 'mysql' or 'sqlite'

let dbInstance = null
let dbInitialized = false

/**
 * Initialize database connection
 */
async function initDatabase() {
  if (dbInitialized && dbInstance) return dbInstance

  if (DB_TYPE === 'sqlite') {
    // Use SQLite for development
    const { initDatabase: initSQLite, getDatabase } = await import('./db-sqlite.js')
    await initSQLite()
    
    const getDb = async () => await getDatabase()
    
    dbInstance = {
      execute: async (query, params = []) => {
        const database = await getDb()
        
        // Convert MySQL-style queries to SQLite
        let sqliteQuery = query
          .replace(/NOW\(\)/gi, "datetime('now', 'localtime')")
          .replace(/CURRENT_TIMESTAMP/gi, "datetime('now', 'localtime')")
        
        // Handle INSERT queries
        if (sqliteQuery.trim().toUpperCase().startsWith('INSERT')) {
          const result = await database.run(sqliteQuery, params)
          return [{ insertId: result.lastID, affectedRows: result.changes }]
        }
        
        // Handle UPDATE queries
        if (sqliteQuery.trim().toUpperCase().startsWith('UPDATE')) {
          const result = await database.run(sqliteQuery, params)
          return [{ affectedRows: result.changes }]
        }
        
        // Handle SELECT queries
        const rows = await database.all(sqliteQuery, params)
        return [rows]
      }
    }
    
    console.log('✅ SQLite database initialized')
  } else {
    // Use MySQL for production
    const mysql = await import('mysql2/promise')
    
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'restaurant_pos',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: '+03:00'
    })
    
    // Test connection
    try {
      const connection = await pool.getConnection()
      console.log('✅ MySQL database connected successfully')
      connection.release()
    } catch (err) {
      console.error('❌ MySQL database connection error:', err.message)
      console.log('💡 Tip: DB_TYPE=sqlite kullanarak SQLite\'a geçebilirsiniz')
    }
    
    dbInstance = pool
  }

  dbInitialized = true
  return dbInstance
}

// Create a proxy object that initializes on first use
const db = {
  async execute(query, params) {
    if (!dbInitialized) {
      await initDatabase()
    }
    return dbInstance.execute(query, params)
  }
}

// Auto-initialize in background (non-blocking)
initDatabase().catch(err => {
  console.error('❌ Database initialization error:', err)
})

export default db
