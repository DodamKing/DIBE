const mongoose = require('mongoose')
const Schema = mongoose.Schema

const playCntSchema = new Schema({
    songId : String,
    userId : String, // _id
    playCnt : {
        type : Number,
        default : 1,
    },
})

module.exports = mongoose.model('PlayCnt', playCntSchema)