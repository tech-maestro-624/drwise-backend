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
},{timestamps : true})

module.exports = mongoose.model('SubCategory',subCategorySchema)