const mongoose = require('mongoose')
const Schema = mongoose.Schema

const subCategorySchema = new Schema({
    parentCategory : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Category',
        required : true
    },
    icon : String,
    name : String,
    description: {
        type: String,
    },
    image : String,
    orderNo: {
        type: Number,
        required: true,
        default: 0
    }
},{timestamps : true})

// Ensure orderNo is unique within the parent category
subCategorySchema.index({ parentCategory: 1, orderNo: 1 });

module.exports = mongoose.model('SubCategory',subCategorySchema)