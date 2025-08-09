# GovBot - AI-Powered Government Assistant for Sri Lanka

A comprehensive government services platform that provides citizens with easy access to various government services, applications, and information through an intuitive web interface.

## 🌟 Features

- **Multi-Language Support**: English, Sinhala, and Tamil
- **Dynamic Service Applications**: Configurable forms for different government departments
- **Real-time Chat Support**: AI-powered chatbot for citizen assistance
- **Service Categories**: Documents & Certificates, Benefits & Subsidies, Business Services, Healthcare Services
- **User Management**: Registration, login, and profile management
- **Application Tracking**: Submit and track government service applications
- **Complaint System**: Submit and track complaints
- **Office Locator**: Find nearest government offices with GPS coordinates
- **Responsive Design**: Mobile-friendly interface

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **MySQL** (v8.0 or higher)
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repository-url>
   cd tech-triathlon
   ```

2. **Install Node.js and npm**

   **Windows:**

   - Download from [Node.js official website](https://nodejs.org/)
   - Run the installer and follow the setup wizard
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

   **macOS:**

   ```bash
   # Using Homebrew
   brew install node

   # Or download from official website
   ```

   **Linux (Ubuntu/Debian):**

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Database Setup**

   **Option 1: Using the SQL file (Recommended)**

   ```bash
   # Start MySQL service
   # Windows: Start MySQL from Services or XAMPP
   # macOS: brew services start mysql
   # Linux: sudo systemctl start mysql

   # Login to MySQL
   mysql -u root -p

   # Create and use database
   CREATE DATABASE IF NOT EXISTS govbot_sl;
   USE govbot_sl;

   # Exit MySQL
   exit

   # Import the SQL file
   mysql -u root -p govbot_sl < Tech-Triathlon..sql
   ```

   **Option 2: Manual database creation**

   ```sql
   CREATE DATABASE IF NOT EXISTS govbot_sl;
   USE govbot_sl;

   -- The app will automatically create tables when it starts
   ```

5. **Configure Database Connection**

   Edit `app.js` and update the database connection details:

   ```javascript
   const db = mysql.createConnection({
     host: "localhost",
     user: "root",
     password: "your_mysql_password", // Update this
     database: "govbot_sl",
   });
   ```

6. **Start the Application**

   ```bash
   node app.js
   ```

7. **Access the Application**
   - Open your browser and go to `http://localhost:3000`
   - The application will be available at the specified port

## 🗄️ Database Schema

The application automatically creates the following tables:

- **users**: User accounts and profiles
- **services**: Available government services with dynamic form configurations
- **applications**: Service applications submitted by users
- **complaints**: User complaints and feedback
- **offices**: Government office locations and contact information
- **chat_sessions**: Chat conversation history

## 📁 Project Structure

```
tech-triathlon/
├── app.js                          # Main server file
├── package.json                    # Node.js dependencies
├── Tech-Triathlon..sql            # Database schema and sample data
├── public/                         # Frontend files
│   ├── index.html                  # Main application page
│   ├── style.css                   # Main stylesheet
│   ├── script.js                   # Main JavaScript logic
│   ├── benefits.html               # Benefits services page
│   ├── documents.html              # Documents services page
│   ├── business-services.html      # Business services page
│   ├── healthcare-services.html    # Healthcare services page
│   └── uploads/                    # File upload directory
├── node_modules/                   # Installed packages
└── README.md                       # This file
```

## 🔧 Configuration

### Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=govbot_sl
JWT_SECRET=your_jwt_secret_key
```

### JWT Secret Key

For production, change the JWT secret key in `app.js`:

```javascript
const token = jwt.sign(
  { user_id: user.id, nic: user.nic },
  process.env.JWT_SECRET || "your_secure_secret_key",
  { expiresIn: "24h" }
);
```

## 🚀 Running the Application

### Development Mode

```bash
node app.js
```

### Production Mode (Using PM2)

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start app.js --name "govbot"

# Monitor the application
pm2 monit

# View logs
pm2 logs govbot

# Stop the application
pm2 stop govbot

# Restart the application
pm2 restart govbot
```

## 📱 Available Services

### 1. Documents & Certificates

- NIC (National Identity Card) renewal
- Birth Certificate
- Passport Application
- Marriage Certificate

### 2. Benefits & Subsidies

- Samurdhi Benefits
- Agricultural Subsidies
- Pension Services

### 3. Business Services

- Business Registration
- Trade Licenses
- Tax Filing

### 4. Healthcare Services

- Health Insurance
- Medical Appointments
- Medical Device Registration

## 🛠️ Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```bash
   # Find process using port 3000
   netstat -ano | findstr :3000

   # Kill the process (Windows)
   taskkill /F /IM node.exe

   # Kill the process (Linux/macOS)
   lsof -ti:3000 | xargs kill -9
   ```

2. **Database Connection Error**

   - Verify MySQL service is running
   - Check database credentials in `app.js`
   - Ensure database `govbot_sl` exists

3. **Module Not Found Errors**

   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Permission Denied (Linux/macOS)**
   ```bash
   # Fix file permissions
   chmod +x app.js
   sudo npm install -g pm2
   ```

## 🔒 Security Considerations

- **JWT Secret**: Change the default JWT secret key for production
- **Database Password**: Use strong passwords for database access
- **Environment Variables**: Store sensitive configuration in environment variables
- **HTTPS**: Use HTTPS in production environments
- **Input Validation**: All user inputs are validated and sanitized

## 📊 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/services` - Get all services
- `GET /api/services/:category` - Get services by category
- `POST /api/applications` - Submit application
- `GET /api/applications/:userId` - Get user applications
- `POST /api/complaints` - Submit complaint
- `GET /api/offices/nearest` - Find nearest offices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above

## 🎯 Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced AI chatbot integration
- [ ] Payment gateway integration
- [ ] Document verification system
- [ ] Multi-language voice support
- [ ] Analytics dashboard
- [ ] API rate limiting
- [ ] Advanced security features

---

**Built with ❤️ for the citizens of Sri Lanka**
