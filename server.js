import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // In production, use an environment variable

// Initialize database
console.log('Initializing database...');
const dbPath = join(__dirname, 'hipot_logs.db');
console.log('Database path:', dbPath);

const db = new Database(dbPath);
console.log('Database connection established');

// Create tables if they don't exist
console.log('Creating tables...');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);
console.log('Users table created');

db.exec(`
  CREATE TABLE IF NOT EXISTS pdf_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_order_number TEXT,
    operator TEXT,
    test_date TEXT,
    serial_number TEXT,
    pdf_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
console.log('PDF logs table created');

// Add admin user if it doesn't exist
console.log('Checking for admin user...');
const adminUser = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
console.log('Admin user exists:', !!adminUser);

if (!adminUser) {
  console.log('Creating admin user...');
  const hashedPassword = bcrypt.hashSync('admin', 10);
  const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  const result = stmt.run('admin', hashedPassword);
  console.log('Admin user created:', result);
}

// Verify admin user
const verifyAdmin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
console.log('Verified admin user exists:', !!verifyAdmin);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://192.168.0.223:8080',
    'http://192.168.0.223:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase payload size limit for PDF data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, {
    headers: req.headers,
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
    origin: req.headers.origin,
    body: req.method === 'POST' ? req.body : undefined
  });
  next();
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ 
      message: 'Authentication required',
      code: 'NO_TOKEN'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification failed:', err);
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(403).json({
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    req.user = user;
    next();
  });
};

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt:', {
      username: req.body.username,
      hasPassword: !!req.body.password,
      origin: req.headers.origin
    });

    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      console.log('Login failed: Invalid credentials');
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful:', {
      username: user.username,
      origin: req.headers.origin
    });

    res.json({
      success: true,
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Debug route to check database contents
app.get('/api/debug/logs', (req, res) => {
  try {
    // Get all logs
    const logs = db.prepare(`
      SELECT id, serial_number, work_order_number, operator, test_date, created_at
      FROM pdf_logs
      ORDER BY created_at DESC
    `).all();

    // Get table info
    const tableInfo = db.prepare(`PRAGMA table_info(pdf_logs)`).all();

    // Get database file info
    const dbFileExists = fs.existsSync(dbPath);

    res.json({
      success: true,
      database_exists: dbFileExists,
      database_path: dbPath,
      table_schema: tableInfo,
      total_logs: logs.length,
      logs: logs.map(log => ({
        ...log,
        created_at: new Date(log.created_at).toISOString()
      }))
    });
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Protected API routes
app.get('/logs', authenticateToken, (req, res) => {
  try {
    console.log('Fetching all logs...');
    const logs = db.prepare(`
      SELECT id, work_order_number, operator, test_date, serial_number, created_at, pdf_data
      FROM pdf_logs
      ORDER BY created_at DESC
    `).all();

    console.log(`Found ${logs.length} logs`);
    res.json({
      success: true,
      logs: logs.map(log => ({
        ...log,
        created_at: new Date(log.created_at).toISOString()
      }))
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/logs', authenticateToken, (req, res) => {
  try {
    console.log('Received work order save request:', {
      workOrderNumber: req.body.workOrderNumber,
      operator: req.body.operator,
      testDate: req.body.testDate,
      serialCount: req.body.serialEntries?.length,
      pdfDataLength: req.body.pdfData?.length,
      contentType: req.headers['content-type']
    });

    // Validate required fields
    if (!req.body.workOrderNumber || !req.body.operator || !req.body.testDate) {
      console.error('Missing required fields:', {
        workOrderNumber: !req.body.workOrderNumber,
        operator: !req.body.operator,
        testDate: !req.body.testDate
      });
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    if (!req.body.serialEntries || !Array.isArray(req.body.serialEntries)) {
      console.error('Invalid serial entries:', {
        serialEntries: req.body.serialEntries
      });
      return res.status(400).json({
        success: false,
        error: 'Invalid serial entries format'
      });
    }

    if (!req.body.pdfData) {
      console.error('Missing PDF data');
      return res.status(400).json({
        success: false,
        error: 'Missing PDF data'
      });
    }

    // Insert the log for each serial number
    const stmt = db.prepare(`
      INSERT INTO pdf_logs (
        work_order_number,
        operator,
        test_date,
        serial_number,
        pdf_data,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    const results = [];

    for (const entry of req.body.serialEntries) {
      try {
        console.log('Inserting entry:', {
          workOrderNumber: req.body.workOrderNumber,
          serialNumber: entry.serialNumber
        });

        const result = stmt.run(
          req.body.workOrderNumber,
          req.body.operator,
          req.body.testDate,
          entry.serialNumber,
          req.body.pdfData,
          now
        );

        results.push(result);
        console.log('Successfully inserted entry:', {
          workOrderNumber: req.body.workOrderNumber,
          serialNumber: entry.serialNumber,
          lastInsertRowid: result.lastInsertRowid
        });
      } catch (error) {
        console.error('Error inserting entry:', {
          workOrderNumber: req.body.workOrderNumber,
          serialNumber: entry.serialNumber,
          error: error.message
        });
        throw error;
      }
    }

    console.log('Successfully saved all entries:', {
      workOrderNumber: req.body.workOrderNumber,
      count: results.length
    });

    res.json({
      success: true,
      results: results
    });
  } catch (error) {
    console.error('Error saving log:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.delete('/logs/:id', authenticateToken, (req, res) => {
  try {
    console.log('Deleting log:', req.params.id);
    const result = db.prepare('DELETE FROM pdf_logs WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Log not found'
      });
    }

    res.json({
      success: true,
      message: 'Log deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Default credentials:');
  console.log('Username: admin');
  console.log('Password: admin');
});
