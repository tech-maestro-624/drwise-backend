// app.js
const express = require('express');
const session = require('express-session');
const passport = require('./src/config/passport');
const connectDB = require('./src/config/db');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const generateCRUDPermissions = require('./src/utils/generatePermissions');

dotenv.config();
const app = express();

// Connect to database
connectDB();

// Trust proxy if behind a reverse proxy (e.g., Heroku, Nginx)
// This is needed when secure cookies are used behind a proxy.
app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
  origin: [
    'http://172.20.29.254:3000',
    'https://192.168.2.7:3001',
    'http://192.168.2.7:3001',
    'https://192.168.2.7:3000',
    'http://192.168.2.7:3000',
    'https://localhost:3001',
    'http://internal.local:3001',
    'http://192.168.0.25:3000',
    'http://192.168.1.6:3000',
    'http://localhost:62448',
    'https://drwise-internal.vercel.app'
  ],
  credentials: true
}));

// Body parser and cookie parser
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cookieParser());

// If you're only running locally without HTTPS, use secure: false.
// Once you deploy with HTTPS, set secure: true and sameSite: 'none'.
// For local dev without HTTPS, do the following:
const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { 
    httpOnly: true,
    secure: isProduction,  // true in production (requires HTTPS)
    sameSite: isProduction ? 'none' : 'lax', // 'none' requires secure and HTTPS in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  }
}));

// Generate CRUD permissions for all models
generateCRUDPermissions()
  .then(() => console.log('CRUD permissions generated'))
  .catch(err => console.error('Error generating permissions:', err));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

console.log(process.env.MONGO_URI);

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

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
