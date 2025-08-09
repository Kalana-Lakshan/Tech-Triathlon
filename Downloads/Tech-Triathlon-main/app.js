const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Lasana17848@',
  database: process.env.DB_NAME || 'govbot_sl'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
  createTables();
});

// Create database tables
function createTables() {
  // Optionally reset DB only when explicitly enabled
  const shouldReset = process.env.DB_RESET === 'true';
  if (shouldReset) {
    const dropTables = [
      'DROP TABLE IF EXISTS applications',
      'DROP TABLE IF EXISTS complaints',
      'DROP TABLE IF EXISTS chat_sessions',
      'DROP TABLE IF EXISTS services',
      'DROP TABLE IF EXISTS offices',
      'DROP TABLE IF EXISTS users'
    ];

    dropTables.forEach(dropTable => {
      db.query(dropTable, (err) => {
        if (err) console.error('Error dropping table:', err);
      });
    });
  }

  // Create tables with new schema (idempotent)
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nic VARCHAR(12) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100),
      phone VARCHAR(15),
      language ENUM('sinhala', 'tamil', 'english') DEFAULT 'english',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category VARCHAR(100) NOT NULL,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      requirements TEXT,
      fees DECIMAL(10,2),
      processing_time VARCHAR(100),
      department VARCHAR(100),
      form_fields JSON,
      department_contact VARCHAR(15),
      department_email VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS offices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      department VARCHAR(100) NOT NULL,
      address TEXT,
      city VARCHAR(100),
      district VARCHAR(100),
      phone VARCHAR(15),
      email VARCHAR(100),
      latitude DECIMAL(10,8),
      longitude DECIMAL(11,8),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      service_id INT,
      status ENUM('pending', 'processing', 'approved', 'rejected', 'completed') DEFAULT 'pending',
      reference_number VARCHAR(20) UNIQUE,
      documents TEXT,
      appointment_date DATETIME,
      form_data JSON,
      department_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (service_id) REFERENCES services(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS complaints (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      subject VARCHAR(200) NOT NULL,
      description TEXT,
      status ENUM('open', 'investigating', 'resolved', 'closed') DEFAULT 'open',
      assigned_officer VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS chat_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      session_id VARCHAR(100) UNIQUE,
      language ENUM('sinhala', 'tamil', 'english'),
      status ENUM('active', 'closed', 'escalated') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`
  ];

  // Create tables (after drop if any)
  const createAfterMs = shouldReset ? 1000 : 0;
  setTimeout(() => {
    tables.forEach(table => {
      db.query(table, (err) => {
        if (err) console.error('Error creating table:', err);
      });
    });

    // Insert sample data after tables are created
    setTimeout(() => {
      insertSampleData();
      // Ensure schema migrations for existing databases
      migrateSchema();
    }, 1000);
  }, createAfterMs);
}

// Run lightweight schema migrations to add any missing columns/indexes
function migrateSchema() {
  // Helper to add a column only if it's missing (compatible with older MySQL)
  function ensureColumn(tableName, columnName, columnDefinition) {
    const checkSql = `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`;
    db.query(checkSql, [tableName, columnName], (err, results) => {
      if (err) {
        console.error('Migration check error:', tableName, columnName, err.code || err.message);
        return;
      }
      const exists = results && results[0] && results[0].cnt > 0;
      if (!exists) {
        const alterSql = `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${columnDefinition}`;
        db.query(alterSql, (alterErr) => {
          if (alterErr) {
            console.error('Migration alter error:', alterSql, alterErr.code || alterErr.message);
          }
        });
      }
    });
  }

  // Applications table
  ensureColumn('applications', 'form_data', 'JSON NULL');
  ensureColumn('applications', 'department_notes', 'TEXT NULL');

  // Services table
  ensureColumn('services', 'form_fields', 'JSON NULL');
  ensureColumn('services', 'department_contact', 'VARCHAR(15) NULL');
  ensureColumn('services', 'department_email', 'VARCHAR(100) NULL');
}

// Insert sample data
function insertSampleData() {
  const services = [
    {
      category: 'Documents & Certificates',
      name: 'NIC Renewal',
      description: 'Renewal of National Identity Card',
      requirements: 'Old NIC, Passport size photos, Application form',
      fees: 500.00,
      processing_time: '7-10 working days',
      department: 'Department of Registration of Persons',
      form_fields: JSON.stringify({
        personal_info: ['full_name', 'nic_number', 'date_of_birth', 'address', 'contact_number'],
        documents: ['old_nic', 'passport_photos', 'application_form'],
        additional_info: ['reason_for_renewal', 'emergency_contact']
      }),
      department_contact: '+94-11-2345678',
      department_email: 'nic@dorp.gov.lk'
    },
    {
      category: 'Documents & Certificates',
      name: 'Birth Certificate',
      description: 'Obtain birth certificate',
      requirements: 'Parents ID, Hospital records, Application form',
      fees: 200.00,
      processing_time: '3-5 working days',
      department: 'Department of Registration of Persons',
      form_fields: JSON.stringify({
        child_info: ['child_full_name', 'date_of_birth', 'place_of_birth', 'gender'],
        parent_info: ['father_name', 'father_nic', 'mother_name', 'mother_nic'],
        documents: ['hospital_records', 'parents_id', 'application_form'],
        additional_info: ['marital_status_parents', 'witness_details']
      }),
      department_contact: '+94-11-2345678',
      department_email: 'birth@dorp.gov.lk'
    },
    {
      category: 'Benefits & Subsidies',
      name: 'Samurdhi Benefits',
      description: 'Apply for Samurdhi welfare benefits',
      requirements: 'NIC, Income certificate, Application form',
      fees: 0.00,
      processing_time: '15-20 working days',
      department: 'Ministry of Social Welfare',
      form_fields: JSON.stringify({
        personal_info: ['full_name', 'nic_number', 'date_of_birth', 'address', 'contact_number'],
        family_info: ['family_size', 'children_count', 'elderly_count', 'disabled_members'],
        financial_info: ['monthly_income', 'income_source', 'expenses', 'assets'],
        documents: ['nic', 'income_certificate', 'family_photos', 'application_form'],
        additional_info: ['special_circumstances', 'previous_benefits']
      }),
      department_contact: '+94-11-3456789',
      department_email: 'samurdhi@socialwelfare.gov.lk'
    },
    {
      category: 'Business Services',
      name: 'Business Registration',
      description: 'Register new business',
      requirements: 'NIC, Business plan, Application form',
      fees: 2500.00,
      processing_time: '10-15 working days',
      department: 'Department of Registrar of Companies',
      form_fields: JSON.stringify({
        business_info: ['business_name', 'business_type', 'business_address', 'business_phone', 'business_email'],
        owner_info: ['owner_name', 'owner_nic', 'owner_address', 'owner_contact'],
        business_details: ['business_activities', 'employee_count', 'startup_capital', 'expected_revenue'],
        documents: ['nic', 'business_plan', 'financial_statements', 'premises_agreement', 'application_form'],
        additional_info: ['partnership_details', 'shareholder_info', 'tax_registration']
      }),
      department_contact: '+94-11-4567890',
      department_email: 'business@roc.gov.lk'
    },
    {
      category: 'Healthcare Services',
      name: 'Health Insurance',
      description: 'Apply for government health insurance',
      requirements: 'NIC, Medical certificate, Application form',
      fees: 1000.00,
      processing_time: '5-7 working days',
      department: 'Ministry of Health',
      form_fields: JSON.stringify({
        personal_info: ['full_name', 'nic_number', 'date_of_birth', 'address', 'contact_number'],
        health_info: ['current_health_status', 'existing_conditions', 'medications', 'allergies'],
        family_health: ['family_medical_history', 'genetic_conditions'],
        documents: ['nic', 'medical_certificate', 'health_records', 'application_form'],
        additional_info: ['preferred_hospital', 'emergency_contact', 'dependents']
      }),
      department_contact: '+94-11-5678901',
      department_email: 'health@health.gov.lk'
    },
    {
      category: 'Documents & Certificates',
      name: 'Passport Application',
      description: 'Apply for new passport or renewal',
      requirements: 'NIC, Birth certificate, Photos, Application form',
      fees: 1500.00,
      processing_time: '10-15 working days',
      department: 'Department of Immigration and Emigration',
      form_fields: JSON.stringify({
        personal_info: ['full_name', 'nic_number', 'date_of_birth', 'place_of_birth', 'address', 'contact_number'],
        travel_info: ['purpose_of_travel', 'destination_countries', 'planned_dates', 'previous_passports'],
        documents: ['nic', 'birth_certificate', 'passport_photos', 'application_form'],
        additional_info: ['emergency_contact', 'employment_details', 'sponsor_info']
      }),
      department_contact: '+94-11-6789012',
      department_email: 'passport@immigration.gov.lk'
    },
    {
      category: 'Benefits & Subsidies',
      name: 'Agricultural Subsidies',
      description: 'Apply for agricultural subsidies and support',
      requirements: 'NIC, Land ownership documents, Crop details, Application form',
      fees: 0.00,
      processing_time: '20-25 working days',
      department: 'Ministry of Agriculture',
      form_fields: JSON.stringify({
        personal_info: ['full_name', 'nic_number', 'date_of_birth', 'address', 'contact_number'],
        agricultural_info: ['land_size', 'crop_types', 'irrigation_facilities', 'farming_experience'],
        financial_info: ['annual_income', 'loan_details', 'previous_subsidies'],
        documents: ['nic', 'land_documents', 'crop_records', 'income_certificate', 'application_form'],
        additional_info: ['special_requirements', 'cooperative_membership', 'training_needs']
      }),
      department_contact: '+94-11-7890123',
      department_email: 'agriculture@agri.gov.lk'
    }
  ];

  const offices = [
    {
      name: 'Colombo District Secretariat',
      department: 'General Administration',
      address: 'No. 123, Galle Road, Colombo 03',
      city: 'Colombo',
      district: 'Colombo',
      phone: '+94-11-2345678',
      email: 'colombo@district.gov.lk',
      latitude: 6.9271,
      longitude: 79.8612
    },
    {
      name: 'Kandy District Secretariat',
      department: 'General Administration',
      address: 'No. 456, Peradeniya Road, Kandy',
      city: 'Kandy',
      district: 'Kandy',
      phone: '+94-81-2345678',
      email: 'kandy@district.gov.lk',
      latitude: 7.2906,
      longitude: 80.6337
    },
    {
      name: 'Jaffna District Secretariat',
      department: 'General Administration',
      address: 'No. 789, Kandy Road, Jaffna',
      city: 'Jaffna',
      district: 'Jaffna',
      phone: '+94-21-2345678',
      email: 'jaffna@district.gov.lk',
      latitude: 9.6615,
      longitude: 80.0255
    }
  ];

  // Insert services
  services.forEach(service => {
    db.query('INSERT IGNORE INTO services SET ?', service, (err) => {
      if (err) console.error('Error inserting service:', err);
    });
  });

  // Insert offices
  offices.forEach(office => {
    db.query('INSERT IGNORE INTO offices SET ?', office, (err) => {
      if (err) console.error('Error inserting office:', err);
    });
  });
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Routes

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// User registration
app.post('/api/register', async (req, res) => {
  try {
    const { nic, name, email, phone, language } = req.body;
    
    // Check if user already exists
    db.query('SELECT * FROM users WHERE nic = ?', [nic], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Create new user
      const newUser = { nic, name, email, phone, language };
      db.query('INSERT INTO users SET ?', newUser, (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Error creating user' });
        }
        
        res.json({ 
          message: 'User registered successfully',
          user_id: result.insertId 
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User login
app.post('/api/login', (req, res) => {
  const { nic } = req.body;
  
  db.query('SELECT * FROM users WHERE nic = ?', [nic], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = results[0];
    const token = jwt.sign({ user_id: user.id, nic: user.nic }, 'govbot_secret_key', { expiresIn: '24h' });
    
    res.json({ 
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        nic: user.nic,
        name: user.name,
        language: user.language
      }
    });
  });
});

// Get services by category
app.get('/api/services/:category', (req, res) => {
  const { category } = req.params;
  
  db.query('SELECT * FROM services WHERE category = ?', [category], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(results);
  });
});

// Get all services
app.get('/api/services', (req, res) => {
  db.query('SELECT * FROM services', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(results);
  });
});

// Get service by ID with form fields
app.get('/api/services/id/:id', (req, res) => {
  const { id } = req.params;
  
  db.query('SELECT * FROM services WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    const service = results[0];
    
    // Parse JSON fields
    try {
      if (service.form_fields) {
        service.form_fields = JSON.parse(service.form_fields);
      }
    } catch (e) {
      service.form_fields = {};
    }
    
    res.json(service);
  });
});

// Get nearest offices
app.get('/api/offices/nearest', (req, res) => {
  const { latitude, longitude, department } = req.query;
  
  let query = 'SELECT * FROM offices';
  let params = [];
  
  if (department) {
    query += ' WHERE department = ?';
    params.push(department);
  }
  
  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Calculate distance and sort by nearest
    if (latitude && longitude) {
      results.forEach(office => {
        office.distance = calculateDistance(
          parseFloat(latitude), 
          parseFloat(longitude), 
          office.latitude, 
          office.longitude
        );
      });
      
      results.sort((a, b) => a.distance - b.distance);
    }
    
    res.json(results.slice(0, 5)); // Return top 5 nearest
  });
});

// Submit application
app.post('/api/applications', upload.array('documents', 5), (req, res) => {
  try {
    const { user_id, service_id } = req.body;
    let { appointment_date, form_data } = req.body;
    const documents = req.files ? req.files.map(f => f.filename).join(',') : '';

    // Normalize appointment date for MySQL DATETIME (YYYY-MM-DD HH:MM:SS)
    if (appointment_date) {
      appointment_date = String(appointment_date).replace('T', ' ').trim();
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(appointment_date)) {
        appointment_date = appointment_date + ':00';
      }
    }

    // Ensure form_data is stored as a JSON object, not a JSON string
    let parsedFormData = null;
    if (form_data) {
      if (typeof form_data === 'string') {
        try {
          parsedFormData = JSON.parse(form_data);
        } catch (e) {
          // If it's not valid JSON, store as a string value
          parsedFormData = form_data;
        }
      } else if (typeof form_data === 'object') {
        parsedFormData = form_data;
      }
    }

    // Generate reference number
    const reference_number = 'GB' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

    const application = {
      user_id,
      service_id,
      appointment_date,
      documents,
      reference_number,
      form_data: parsedFormData !== null ? JSON.stringify(parsedFormData) : null
    };

    db.query('INSERT INTO applications SET ?', application, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error creating application' });
      }

      // Emit real-time event to the user's room
      try {
        const roomName = `user:${user_id}`;
        io.to(roomName).emit('application_created', {
          application_id: result.insertId,
          user_id,
          service_id,
          reference_number,
          status: 'pending',
          appointment_date,
          created_at: new Date().toISOString()
        });
      } catch (e) {
        console.error('Error emitting application_created:', e);
      }

      res.json({
        message: 'Application submitted successfully',
        reference_number,
        application_id: result.insertId
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit complaint
app.post('/api/complaints', (req, res) => {
  try {
    const { user_id, subject, description } = req.body;
    
    const complaint = { user_id, subject, description };
    
    db.query('INSERT INTO complaints SET ?', complaint, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error creating complaint' });
      }
      
      // Emit real-time event to the user's room
      try {
        const roomName = `user:${user_id}`;
        io.to(roomName).emit('complaint_created', {
          complaint_id: result.insertId,
          user_id,
          subject,
          description
        });
      } catch (e) {
        console.error('Error emitting complaint_created:', e);
      }

      res.json({ 
        message: 'Complaint submitted successfully',
        complaint_id: result.insertId
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user complaints count
app.get('/api/complaints/user/:user_id/count', (req, res) => {
  const { user_id } = req.params;
  const query = 'SELECT COUNT(*) AS total FROM complaints WHERE user_id = ?';
  db.query(query, [user_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ total: results[0]?.total || 0 });
  });
});

// Get user applications
app.get('/api/applications/user/:user_id', (req, res) => {
  const { user_id } = req.params;
  
  const query = `
    SELECT a.*, s.name as service_name, s.category 
    FROM applications a 
    JOIN services s ON a.service_id = s.id 
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
  `;
  
  db.query(query, [user_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(results);
  });
});

// Dashboard summary for a specific user
app.get('/api/dashboard/user/:user_id', (req, res) => {
  const { user_id } = req.params;

  const appsCountSql = `
    SELECT 
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status IN ('approved','completed') THEN 1 ELSE 0 END) AS completed
    FROM applications
    WHERE user_id = ?
  `;

  const recentAppsSql = `
    SELECT a.id, a.reference_number, a.status, a.created_at, s.name AS service_name
    FROM applications a
    JOIN services s ON a.service_id = s.id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
    LIMIT 3
  `;

  const complaintsCountSql = `
    SELECT COUNT(*) AS total FROM complaints WHERE user_id = ?
  `;

  db.query(appsCountSql, [user_id], (err, appsCounts) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    db.query(recentAppsSql, [user_id], (err2, recentApps) => {
      if (err2) return res.status(500).json({ error: 'Database error' });

      db.query(complaintsCountSql, [user_id], (err3, complaintsCount) => {
        if (err3) return res.status(500).json({ error: 'Database error' });

        const counts = appsCounts && appsCounts[0] ? appsCounts[0] : { total: 0, pending: 0, completed: 0 };
        const complaintsTotal = complaintsCount && complaintsCount[0] ? complaintsCount[0].total : 0;

        res.json({
          totalApplications: counts.total || 0,
          pendingApplications: counts.pending || 0,
          completedApplications: counts.completed || 0,
          totalComplaints: complaintsTotal || 0,
          recentApplications: recentApps || []
        });
      });
    });
  });
});

// Chat bot responses
app.post('/api/chat', (req, res) => {
  const { message, language, user_id } = req.body;
  
  // Simple keyword-based responses (in real implementation, use AI/ML)
  const responses = {
    english: {
      'nic': 'To renew your NIC, you need: Old NIC, 2 passport photos, and application form. Processing time: 7-10 days.',
      'passport': 'For passport renewal: Old passport, NIC, photos, and application form. Processing time: 10-15 days.',
      'birth certificate': 'For birth certificate: Parents ID, hospital records, and application form. Processing time: 3-5 days.',
      'samurdhi': 'For Samurdhi benefits: NIC, income certificate, and application form. Processing time: 15-20 days.',
      'help': 'I can help you with: NIC renewal, passport, birth certificate, Samurdhi benefits, business registration, and more. What do you need?'
    },
    sinhala: {
      'nic': 'ඔබගේ NIC අලුත් කිරීමට අවශ්‍ය: පරණ NIC, ඡායාරූප 2ක්, සහ අයදුම් පත්‍රය. සැකසීමේ කාලය: දින 7-10.',
      'passport': 'Passport අලුත් කිරීමට: පරණ passport, NIC, ඡායාරූප, සහ අයදුම් පත්‍රය. සැකසීමේ කාලය: දින 10-15.',
      'help': 'මට ඔබට උදව් කළ හැක්කේ: NIC අලුත් කිරීම, passport, උපත සහතිකය, Samurdhi ප්‍රතිලාභ, ව්‍යාපාර ලියාපදිංචිය, සහ තවත් බොහෝ දේ. ඔබට අවශ්‍ය කුමක්ද?'
    },
    tamil: {
      'nic': 'உங்கள் NIC புதுப்பிக்க: பழைய NIC, 2 பாஸ்போர்ட் புகைப்படங்கள், மற்றும் விண்ணப்ப படிவம். செயலாக்க நேரம்: 7-10 நாட்கள்.',
      'passport': 'Passport புதுப்பிக்க: பழைய passport, NIC, புகைப்படங்கள், மற்றும் விண்ணப்ப படிவம். செயலாக்க நேரம்: 10-15 நாட்கள்.',
      'help': 'நான் உங்களுக்கு உதவ முடியும்: NIC புதுப்பித்தல், passport, பிறப்பு சான்றிதழ், Samurdhi நன்மைகள், வணிக பதிவு, மற்றும் பல. உங்களுக்கு என்ன தேவை?'
    }
  };
  
  const lang = language || 'english';
  const langResponses = responses[lang] || responses.english;
  
  let response = langResponses.help;
  
  // Check for keywords
  for (const [keyword, reply] of Object.entries(langResponses)) {
    if (message.toLowerCase().includes(keyword)) {
      response = reply;
      break;
    }
  }
  
  // Create chat session if user_id provided
  if (user_id) {
    const session_id = 'session_' + Date.now();
    db.query('INSERT INTO chat_sessions (user_id, session_id, language) VALUES (?, ?, ?)', 
      [user_id, session_id, lang], (err) => {
        if (err) console.error('Error creating chat session:', err);
      });
  }
  
  res.json({ response, language: lang });
});

// Calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join a user-specific room for real-time updates
  socket.on('join_user', (data) => {
    try {
      if (data && data.user_id) {
        const roomName = `user:${data.user_id}`;
        socket.join(roomName);
        console.log(`Socket ${socket.id} joined room ${roomName}`);
      }
    } catch (e) {
      console.error('join_user error:', e);
    }
  });

  socket.on('join_chat', (data) => {
    socket.join(data.session_id);
  });
  
  socket.on('chat_message', (data) => {
    io.to(data.session_id).emit('chat_message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Create uploads directory
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`GovBot server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
