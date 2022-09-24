const mongoose = require('mongoose')
const Schema = mongoose.Schema

const chartSchema = new Schema({
    songId : String,
    title : String,
    artist : String,
    img : String,
    isFile : Number,
    ytURL : String,
    createdAt: {
        type: Date,
        default: Date().toLocaleString()
    },
})

module.exports = mongoose.model('Chart', chartSchema)