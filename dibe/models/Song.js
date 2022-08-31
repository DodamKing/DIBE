const mongoose = require('mongoose')
const Schema = mongoose.Schema

const songSchema = new Schema({
    title : {
        type : String,
        allowNull : false,
    },
    artist : {
        type : String,
        allowNull : false,
    },
    img : {
        type : String,
        allowNull : false,
    },
    album : {
        type : String,
        // default : '',
    },
    release : {
        type : String,
        // default : '',
    },
    genre : {
        type : String,
        // default : null,
    },
    write : { //작곡
        type : String,
        // default : null,
    }, 
    words :  { //작사
        type : String,
        // default : null,
    }, 
    arrange : { //편곡
        type : String,
        // default : '',
    },
    lyrics : String, //가사
    likes : { //좋아요
        type : Number, 
        default : 0,
    },
    ytURL : String,
    isFile : { //음원파일 유무
        type : Number,
        default : 0,
    },
    createdAt: {
        type: Date,
        default: Date().toLocaleString()
    },
    updatedAt : {
        type : Date,
        default : Date().toLocaleString()
    },
})

module.exports = mongoose.model('Song', songSchema)