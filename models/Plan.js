const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  planId: {
    type: String,
    required: [true, 'Plan ID is required'],
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
    maxlength: [100, 'Plan name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Plan description is required'],
    trim: true,
    maxlength: [500, 'Plan description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Plan category is required'],
    enum: {
      values: ['basic', 'premium', 'enterprise', 'trial', 'custom'],
      message: 'Category must be one of: basic, premium, enterprise, trial, custom'
    },
    index: true
  },
  pricing: {
    monthly: {
      amount: {
        type: Number,
        required: [true, 'Monthly price is required'],
        min: [0, 'Price cannot be negative']
      },
      currency: {
        type: String,
        required: [true, 'Currency is required'],
        uppercase: true,
        default: 'USD',
        match: [/^[A-Z]{3}$/, 'Currency must be a 3-letter code']
      }
    },
    quarterly: {
      amount: {
        type: Number,
        min: [0, 'Price cannot be negative']
      },
      currency: {
        type: String,
        uppercase: true,
        default: 'USD'
      },
      discount: {
        type: Number,
        min: [0, 'Discount cannot be negative'],
        max: [100, 'Discount cannot exceed 100%']
      }
    },
    yearly: {
      amount: {
        type: Number,
        min: [0, 'Price cannot be negative']
      },
      currency: {
        type: String,
        uppercase: true,
        default: 'USD'
      },
      discount: {
        type: Number,
        min: [0, 'Discount cannot be negative'],
        max: [100, 'Discount cannot exceed 100%']
      }
    }
  },
  features: [{
    name: {
      type: String,
      required: [true, 'Feature name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    included: {
      type: Boolean,
      default: true
    },
    limit: {
      type: Number,
      min: [0, 'Limit cannot be negative']
    },
    unit: {
      type: String,
      trim: true
    }
  }],
  limits: {
    users: {
      type: Number,
      min: [1, 'User limit must be at least 1'],
      default: 1
    },
    storage: {
      amount: {
        type: Number,
        min: [0, 'Storage amount cannot be negative']
      },
      unit: {
        type: String,
        enum: ['MB', 'GB', 'TB'],
        default: 'GB'
      }
    },
    bandwidth: {
      amount: {
        type: Number,
        min: [0, 'Bandwidth amount cannot be negative']
      },
      unit: {
        type: String,
        enum: ['MB', 'GB', 'TB'],
        default: 'GB'
      }
    },
    apiCalls: {
      type: Number,
      min: [0, 'API calls limit cannot be negative']
    }
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'deprecated'],
      message: 'Status must be active, inactive, or deprecated'
    },
    default: 'active',
    index: true
  },
  visibility: {
    type: String,
    enum: {
      values: ['public', 'private', 'hidden'],
      message: 'Visibility must be public, private, or hidden'
    },
    default: 'public'
  },
  trial: {
    available: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number,
      min: [1, 'Trial duration must be at least 1 day'],
      default: 7
    },
    unit: {
      type: String,
      enum: ['days', 'weeks', 'months'],
      default: 'days'
    }
  },
  setupFee: {
    amount: {
      type: Number,
      min: [0, 'Setup fee cannot be negative'],
      default: 0
    },
    currency: {
      type: String,
      uppercase: true,
      default: 'USD'
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  metadata: {
    type: Map,
    of: String,
    default: new Map()
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
planSchema.index({ category: 1, status: 1 });
planSchema.index({ 'pricing.monthly.amount': 1 });
planSchema.index({ sortOrder: 1, createdAt: -1 });
planSchema.index({ tags: 1 });

// Virtual for monthly savings compared to yearly
planSchema.virtual('yearlySavings').get(function() {
  if (!this.pricing.yearly.amount || !this.pricing.monthly.amount) return 0;
  const monthlyTotal = this.pricing.monthly.amount * 12;
  return monthlyTotal - this.pricing.yearly.amount;
});

// Virtual for quarterly savings compared to monthly
planSchema.virtual('quarterlySavings').get(function() {
  if (!this.pricing.quarterly.amount || !this.pricing.monthly.amount) return 0;
  const monthlyTotal = this.pricing.monthly.amount * 3;
  return monthlyTotal - this.pricing.quarterly.amount;
});

// Virtual for feature count
planSchema.virtual('featureCount').get(function() {
  return this.features ? this.features.filter(f => f.included).length : 0;
});

// Pre-save middleware to generate planId
planSchema.pre('save', function(next) {
  if (!this.planId) {
    this.planId = 'PLAN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  next();
});

// Pre-save middleware to calculate discounted prices
planSchema.pre('save', function(next) {
  // Calculate quarterly price with discount
  if (this.pricing.quarterly.discount && this.pricing.monthly.amount) {
    const quarterlyBase = this.pricing.monthly.amount * 3;
    this.pricing.quarterly.amount = quarterlyBase * (1 - this.pricing.quarterly.discount / 100);
  }
  
  // Calculate yearly price with discount
  if (this.pricing.yearly.discount && this.pricing.monthly.amount) {
    const yearlyBase = this.pricing.monthly.amount * 12;
    this.pricing.yearly.amount = yearlyBase * (1 - this.pricing.yearly.discount / 100);
  }
  
  next();
});

// Instance method to check if plan is active
planSchema.methods.isActive = function() {
  return this.status === 'active';
};

// Instance method to get price for billing cycle
planSchema.methods.getPriceForCycle = function(cycle) {
  switch (cycle) {
    case 'monthly':
      return this.pricing.monthly.amount;
    case 'quarterly':
      return this.pricing.quarterly.amount || this.pricing.monthly.amount * 3;
    case 'yearly':
      return this.pricing.yearly.amount || this.pricing.monthly.amount * 12;
    default:
      return this.pricing.monthly.amount;
  }
};

// Instance method to check if feature is included
planSchema.methods.hasFeature = function(featureName) {
  const feature = this.features.find(f => f.name.toLowerCase() === featureName.toLowerCase());
  return feature && feature.included;
};

// Instance method to get feature limit
planSchema.methods.getFeatureLimit = function(featureName) {
  const feature = this.features.find(f => f.name.toLowerCase() === featureName.toLowerCase());
  return feature ? feature.limit : null;
};

// Static method to find active plans
planSchema.statics.findActivePlans = function() {
  return this.find({ 
    status: 'active',
    visibility: { $in: ['public', 'private'] }
  }).sort({ sortOrder: 1, createdAt: -1 });
};

// Static method to find public plans
planSchema.statics.findPublicPlans = function() {
  return this.find({ 
    status: 'active',
    visibility: 'public'
  }).sort({ sortOrder: 1, 'pricing.monthly.amount': 1 });
};

// Static method to find plans by category
planSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category: category,
    status: 'active'
  }).sort({ sortOrder: 1, 'pricing.monthly.amount': 1 });
};

// Static method to find plans within price range
planSchema.statics.findByPriceRange = function(minPrice, maxPrice, cycle = 'monthly') {
  const priceField = `pricing.${cycle}.amount`;
  return this.find({
    status: 'active',
    [priceField]: { $gte: minPrice, $lte: maxPrice }
  }).sort({ [priceField]: 1 });
};

module.exports = mongoose.model('Plan', planSchema);
