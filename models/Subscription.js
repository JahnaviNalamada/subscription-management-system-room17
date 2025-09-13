const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  subscriptionId: {
    type: String,
    required: [true, 'Subscription ID is required'],
    unique: true,
    trim: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: [true, 'Plan ID is required'],
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'cancelled', 'expired', 'suspended'],
      message: 'Status must be one of: active, inactive, cancelled, expired, suspended'
    },
    default: 'active',
    index: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  nextBillingDate: {
    type: Date,
    required: [true, 'Next billing date is required']
  },
  billingCycle: {
    type: String,
    enum: {
      values: ['monthly', 'quarterly', 'yearly'],
      message: 'Billing cycle must be monthly, quarterly, or yearly'
    },
    required: [true, 'Billing cycle is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    uppercase: true,
    default: 'USD',
    match: [/^[A-Z]{3}$/, 'Currency must be a 3-letter code (e.g., USD, EUR)']
  },
  discount: {
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Discount amount cannot be negative']
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    code: {
      type: String,
      trim: true,
      uppercase: true
    }
  },
  autoRenewal: {
    type: Boolean,
    default: true
  },
  trialPeriod: {
    isActive: {
      type: Boolean,
      default: false
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    }
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'wallet'],
      required: [true, 'Payment method type is required']
    },
    lastFour: {
      type: String,
      match: [/^\d{4}$/, 'Last four digits must be exactly 4 numbers']
    },
    expiryMonth: {
      type: Number,
      min: 1,
      max: 12
    },
    expiryYear: {
      type: Number,
      min: new Date().getFullYear()
    }
  },
  metadata: {
    type: Map,
    of: String,
    default: new Map()
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  cancelledAt: {
    type: Date
  },
  cancelReason: {
    type: String,
    enum: ['user_request', 'payment_failed', 'admin_action', 'expired', 'other']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ planId: 1, status: 1 });
subscriptionSchema.index({ nextBillingDate: 1, status: 1 });
subscriptionSchema.index({ endDate: 1, status: 1 });
subscriptionSchema.index({ createdAt: -1 });

// Virtual for remaining days
subscriptionSchema.virtual('remainingDays').get(function() {
  if (this.status !== 'active') return 0;
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - now;
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
});

// Virtual for subscription duration in days
subscriptionSchema.virtual('durationDays').get(function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffTime = end - start;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for effective price after discount
subscriptionSchema.virtual('effectivePrice').get(function() {
  if (!this.discount.amount) return this.price;
  
  if (this.discount.type === 'percentage') {
    return this.price * (1 - this.discount.amount / 100);
  } else {
    return Math.max(0, this.price - this.discount.amount);
  }
});

// Pre-save middleware to generate subscriptionId
subscriptionSchema.pre('save', function(next) {
  if (!this.subscriptionId) {
    this.subscriptionId = 'SUB_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  next();
});

// Pre-save middleware to set next billing date
subscriptionSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('billingCycle') || this.isModified('startDate')) {
    const start = new Date(this.startDate);
    let nextBilling = new Date(start);
    
    switch (this.billingCycle) {
      case 'monthly':
        nextBilling.setMonth(nextBilling.getMonth() + 1);
        break;
      case 'quarterly':
        nextBilling.setMonth(nextBilling.getMonth() + 3);
        break;
      case 'yearly':
        nextBilling.setFullYear(nextBilling.getFullYear() + 1);
        break;
    }
    
    this.nextBillingDate = nextBilling;
  }
  next();
});

// Instance method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && new Date() <= this.endDate;
};

// Instance method to check if subscription is in trial
subscriptionSchema.methods.isInTrial = function() {
  if (!this.trialPeriod.isActive) return false;
  const now = new Date();
  return now >= this.trialPeriod.startDate && now <= this.trialPeriod.endDate;
};

// Instance method to cancel subscription
subscriptionSchema.methods.cancel = function(reason = 'user_request') {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancelReason = reason;
  this.autoRenewal = false;
  return this.save();
};

// Instance method to renew subscription
subscriptionSchema.methods.renew = function(duration = 1) {
  if (this.status !== 'active') {
    throw new Error('Cannot renew inactive subscription');
  }
  
  const currentEnd = new Date(this.endDate);
  let newEnd = new Date(currentEnd);
  
  switch (this.billingCycle) {
    case 'monthly':
      newEnd.setMonth(newEnd.getMonth() + duration);
      break;
    case 'quarterly':
      newEnd.setMonth(newEnd.getMonth() + (3 * duration));
      break;
    case 'yearly':
      newEnd.setFullYear(newEnd.getFullYear() + duration);
      break;
  }
  
  this.endDate = newEnd;
  this.nextBillingDate = newEnd;
  return this.save();
};

// Static method to find active subscriptions
subscriptionSchema.statics.findActiveSubscriptions = function() {
  return this.find({ 
    status: 'active',
    endDate: { $gte: new Date() }
  });
};

// Static method to find expiring subscriptions
subscriptionSchema.statics.findExpiringSubscriptions = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    status: 'active',
    endDate: { $lte: futureDate, $gte: new Date() }
  });
};

// Static method to find subscriptions by user
subscriptionSchema.statics.findByUser = function(userId) {
  return this.find({ userId })
    .populate('planId', 'name features price')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
