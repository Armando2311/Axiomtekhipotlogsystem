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

// Configure CORS
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://1f6d-2600-1000-a109-4749-dc72-4e30-2e36-88cd.ngrok-free.app',
    'https://hipot-test-log.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

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

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Store decoded user info in request
    next();
  } catch (err) {
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
  const { username, password } = req.body;
  console.log('Login attempt:', { username });

  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    console.log('User found:', !!user);

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    console.log('Password valid:', validPassword);

    if (!validPassword) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    console.log('Token generated successfully');
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
app.post('/api/logs', authenticateToken, (req, res) => {
  try {
    console.log('Received work order save request:', {
      workOrderNumber: req.body.workOrderNumber,
      operator: req.body.operator,
      testDate: req.body.testDate,
      serialCount: req.body.serialEntries?.length,
      pdfDataLength: req.body.pdfData?.length
    });

    // Validate required fields
    if (!req.body.workOrderNumber || !req.body.operator || !req.body.testDate) {
      console.error('Missing required fields:', { body: req.body });
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    if (!req.body.serialEntries || !Array.isArray(req.body.serialEntries)) {
      console.error('Invalid serial entries:', req.body.serialEntries);
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

    const stmt = db.prepare(`
      INSERT INTO pdf_logs (
        work_order_number, operator, test_date, serial_number,
        pdf_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    
    // Insert each serial number as a separate row
    const results = req.body.serialEntries.map(entry => {
      try {
        console.log('Inserting serial entry:', {
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

        console.log('Successfully saved serial entry:', {
          serialNumber: entry.serialNumber,
          lastInsertRowid: result.lastInsertRowid
        });

        return result;
      } catch (error) {
        console.error('Error saving serial entry:', {
          serialNumber: entry.serialNumber,
          error: error.message,
          stack: error.stack
        });
        throw error;
      }
    });

    // Verify the saved entries
    const savedEntries = db.prepare(`
      SELECT * FROM pdf_logs 
      WHERE work_order_number = ? 
      ORDER BY created_at DESC
    `).all(req.body.workOrderNumber);

    console.log('Verification of saved entries:', {
      workOrderNumber: req.body.workOrderNumber,
      expectedCount: req.body.serialEntries.length,
      actualCount: savedEntries.length
    });

    res.json({ 
      success: true, 
      results,
      savedCount: savedEntries.length
    });
  } catch (error) {
    console.error('Error in /api/logs:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    });
  }
});

app.get('/api/logs', authenticateToken, (req, res) => {
  try {
    console.log('Fetching logs...');
    const logs = db.prepare(`
      SELECT 
        id, work_order_number, operator, test_date, 
        serial_number, pdf_data, created_at
      FROM pdf_logs 
      ORDER BY created_at DESC
    `).all();

    // Transform the logs but keep PDF data as is since it's already a data URL
    const transformedLogs = logs.map(log => ({
      id: log.id,
      work_order_number: log.work_order_number,
      operator: log.operator,
      test_date: log.test_date,
      serial_number: log.serial_number,
      pdf_data: log.pdf_data,
      created_at: log.created_at
    }));

    console.log('Fetched logs:', {
      count: transformedLogs.length,
      sample: transformedLogs.slice(0, 2).map(log => ({
        ...log,
        pdf_data: log.pdf_data ? 'PDF data available' : null
      }))
    });

    res.json(transformedLogs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// Delete log endpoint
app.delete('/api/logs/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting log:', { id });
    
    const result = db.prepare('DELETE FROM pdf_logs WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Log not found' 
      });
    }

    console.log('Successfully deleted log:', { id });
    res.json({ success: true });
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
