const mongoose = require('mongoose')
const uri = process.env.DB_URI

const connect = async () => {
    try {
        await mongoose.connect(uri)
        console.log('디비 연결 성공')
    } catch (err) {
        console.error(err)
    }
}

module.exports = connect