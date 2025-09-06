// app.js

const express = require('express');
const connectDB = require('./src/config/db');
const redisConfig = require('./src/config/redis');
const dotenv = require('dotenv');
dotenv.config();
const bodyParser = require('body-parser');
const cors = require('cors');
const generateCRUDPermissions = require('./src/utils/generatePermissions');

const app = express();

// Connect to MongoDB
connectDB();
// Initialize Redis connection
redisConfig.connect()
  .then(() => {
    console.log('Redis connection established');
  })
  .catch(err => {
    console.error('Redis connection failed:', err);
    // Continue without Redis - app should still work
  });

// Generate CRUD permissions for all models
generateCRUDPermissions()
  .then(() => {
    console.log('CRUD permissions generated');
  })
  .catch(err => {
    console.error('Error generating permissions:', err);
  });

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));

app.use(cors({
  origin: [
    'https://app.dr-wise.in',
    'https://drwise-internal.vercel.app',
    'http://192.168.29.241:5001',
    'http://localhost:5001',
    'http://10.0.2.2:5001' // Android emulator
  ],
  credentials: true,
}));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/auth', require('./src/routes/authRoutes'));
app.use('/categories', require('./src/routes/categoryRoutes'));
app.use('/products', require('./src/routes/productRoutes'));
app.use('/leads', require('./src/routes/leadRoutes'));
app.use('/permissions', require('./src/routes/permissionRoutes'));
app.use('/roles', require('./src/routes/roleRoutes'));
app.use('/users', require('./src/routes/userRoutes'));
app.use('/config', require('./src/routes/configurationRoutes'));
app.use('/models', require('./src/routes/modelRoutes'));
app.use('/sale', require('./src/routes/saleRoutes'));
app.use('/wallet', require('./src/routes/walletRoutes'));
app.use('/referal', require('./src/routes/referralRoutes'));
app.use('/affiliate', require('./src/routes/affiliateRoutes'));
app.use('/subcategory', require('./src/routes/subCategoryRoutes'));
app.use('/transaction', require('./src/routes/transactionRoutes'));
app.use('/subscription', require('./src/routes/subscriptionRoutes'));
app.use('/subscription-plans', require('./src/routes/subscriptionPlansRoutes'));
app.use('/payments', require('./src/routes/paymentRoutes'));
app.use('/reports', require('./src/routes/reportRoutes'));
app.use('/files', require('./src/routes/fileRoutes'));
app.use('/clients', require('./src/routes/clientRoutes'));


app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
