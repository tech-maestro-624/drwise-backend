const mongoose = require('mongoose')
const Schema = mongoose.Schema

const subCategorySchema = new Schema({
    parentCategory : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Category',
        required : true
    },
    icon : String
},{timestamps : true})

module.exports = mongoose.model('SubCategory',subCategorySchema)