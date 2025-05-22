const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
  },
  subscriptionType: {
    type: String,
    enum: ['ambassador', 'affiliate'],
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'pending', 'cancelled'],
    default: 'active',
  },
  planDetails: {
    name: String,
    price: Number,
    duration: Number, // in days
    features: [String]
  },
  paymentInfo: {
    transactionId: String,
    paymentMethod: String,
    paymentDate: Date
  }
}, { timestamps: true });

// Add validation to ensure either userId or affiliateId is provided, but not both
subscriptionSchema.pre('validate', function(next) {
  if ((this.userId && this.affiliateId) || (!this.userId && !this.affiliateId)) {
    next(new Error('Either userId or affiliateId must be provided, but not both'));
  }
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);