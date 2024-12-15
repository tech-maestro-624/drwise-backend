const mongoose = require('mongoose');

const affiliateSchema = new mongoose.Schema({
    refferedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref : 'User'
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phoneNumber : String,
    status : String,
    verified : {type : Boolean, default : false }
},{timestamps : true});

module.exports = mongoose.model('Affiliate', affiliateSchema);
