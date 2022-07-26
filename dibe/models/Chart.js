const mongoose = require('mongoose')
const Schema = mongoose.Schema

const chartSchema = new Schema({
    title : String,
    artist : String,
    img : String,
    isFile : Number,
    createdAt: {
        type: Date,
        default: Date().toLocaleString()
    },
})

module.exports = mongoose.model('Chart', chartSchema)