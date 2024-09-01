// config/passport.js

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

passport.use(new LocalStrategy(
  {
    usernameField: 'phoneNumber',
    passwordField: 'otp',
    passReqToCallback: true,
  },
  async (req, phoneNumber, otp, done) => {
    try {
      const user = await User.findOne({ phoneNumber });

      if (!user) {
        return done(null, false, { message: 'Incorrect phone number.' });
      }

      // Check if OTP is valid and not expired
      if (user.otp !== otp || user.otpExpires < Date.now()) {
        return done(null, false, { message: 'Invalid or expired OTP.' });
      }

      // OTP is valid, authenticate the user
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
