// models/Client.js
const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  // Reference to the User model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // One client profile per user
  },

  // Main Client Details
  clientId: {
    type: String,
    unique: true,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  middleName: String,
  lastName: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true // Allow null values while maintaining uniqueness
  },
  address: {
    street: String, // From 'Address' field
    city: String,
    state: {
      type: String,
      required: true
    }
  },
  birthDetails: {
    date: Date, // From 'Birth Date'
    place: String // From 'Birth Place'
  },
  age: Number,
  gender: String,
  physicalDetails: {
    heightInFeet: String, // From 'Height (Feet)'
    weightInKg: Number   // From 'Weight (Kg)'
  },
  education: String,
  maritalStatus: String,
  occupation: {
    type: String,         // From 'Business/Job'
    name: String,         // From 'Name Of Business/Job'
    dutyType: String      // From 'Type Of Duty'
  },
  financials: {
    annualIncome: Number,
    pan: String,          // From 'PAN No.'
    gst: String           // From 'GST No.'
  },
  profileImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FileUpload' // Reference to File model for profile image
  },
  documents: [{
    documentType: {
      type: String,
      required: true,
      enum: ['aadhar', 'pan', 'passport', 'driving_license', 'voter_id', 'bank_statement', 'income_proof', 'address_proof', 'other']
    },
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FileUpload',
      required: true
    }
  }],

  // Additional Information
  additionalInfo: {
    type: String // For the rich text editor content
  },

  // Corporate Details (for business clients)
  corporateDetails: {
    companyName: {
      type: String,
      required: function() { return this.clientType === 'corporate'; } // Conditionally required
    },
    mobile: String,
    email: String,
    address: {
      street: String,
      city: String,
      state: String
    },
    financials: {
      annualIncome: Number,
      pan: String,
      gst: String
    },
    documents: [{
      documentType: {
        type: String,
        required: true,
        enum: ['company_registration', 'gst_certificate', 'pan_card', 'bank_statement', 'financial_statement', 'incorporation_certificate', 'partnership_deed', 'other']
      },
      file: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FileUpload',
        required: true
      }
    }]
  },

  // Family / Employee Details
  familyDetails: [{ // An array of sub-documents for multiple family members
    firstName: {
      type: String,
      required: true
    },
    middleName: String,
    lastName: {
      type: String,
      required: true
    },
    birthDate: Date,
    age: Number,
    gender: String,
    relationship: {
      type: String,
      required: true
    },
    mobile: String,
    pan: String,
    physicalDetails: {
      heightInFeet: String,
      weightInKg: Number
    },
    documents: [{
      documentType: {
        type: String,
        required: true,
        enum: ['aadhar', 'pan', 'passport', 'driving_license', 'voter_id', 'birth_certificate', 'marriage_certificate', 'other']
      },
      file: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FileUpload',
        required: true
      }
    }]
  }],

  // Client type to determine if it's individual or corporate
  clientType: {
    type: String,
    enum: ['individual', 'corporate'],
    default: 'individual'
  },

  // Status of client profile
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Client', ClientSchema);
