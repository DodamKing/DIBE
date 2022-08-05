const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    userId : {
        type : String,
        required : true,
    },
    pwd : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
    },
    phoneNb : String,
    telecom : String,
    userNm : String,
    nickNm : {
        type : String,
        required : true,
    },
    createdAt: {
        type: Date,
        default: Date().toLocaleString()
    },
    updatedAt : {
        type : Date,
        default : Date().toLocaleString()
    },
    visitAt : Date,
})

module.exports = mongoose.model('User', userSchema)
