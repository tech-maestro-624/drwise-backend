// app.js

const express = require('express');
const connectDB = require('./src/config/db');
const dotenv = require('dotenv');
dotenv.config();
const bodyParser = require('body-parser');
const cors = require('cors');
const generateCRUDPermissions = require('./src/utils/generatePermissions');

const app = express();
connectDB();

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
    'http://172.20.29.254:3000',
    'http://localhost:3000',
    'https://localhost:3000',
    'https://192.168.2.7:3001',
    'http://192.168.2.7:3001',
    'https://192.168.2.7:3000',
    'http://192.168.2.7:3000',
    'https://localhost:3001',
    'http://internal.local:3001',
    'http://192.168.0.25:3000',
    'http://192.168.1.6:3000',
    'http://192.168.1.6:3000/',
    'http://localhost:62448',
    'https://drwise-internal.vercel.app',
  ],
  credentials: true,
}));

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
app.use('/reports', require('./src/routes/reportRoutes'));


app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
