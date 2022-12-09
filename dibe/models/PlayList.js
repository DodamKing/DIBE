const mongoose = require('mongoose')
const Schema = mongoose.Schema

const playListSchema = new Schema({
    userId : String, // _id
    listNm : String,
    comment : String,
    content : String,
    createdAt: {
        type: Date,
        default: Date().toLocaleString()
    },
    updatedAt : {
        type : Date,
        default : Date().toLocaleString()
    },
})

module.exports = mongoose.model('PlayList', playListSchema)