const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    userId : String,
    pwd : String,
    email : String,
    phoneNb : String,
    telecom : String,
    userNm : String,
    nickNm : {
        type : String,
        required : true,
    },
    provider : {
        type : String,
        default : 'local',
    },
    snsId : String,
    createdAt: {
        type: Date,
        default: Date().toLocaleString()
    },
    updatedAt : {
        type : Date,
        default : Date().toLocaleString()
    },
    visitAt : Date,
    del : {
        type : Boolean,
        default : false,
    }
})

module.exports = mongoose.model('User', userSchema)
