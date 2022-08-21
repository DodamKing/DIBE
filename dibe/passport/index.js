const passport = require('passport')
const db = require('../models')
const local = require('./localStrategy')
const kakao = require('./kakao')
const naver = require('./naver')
const google = require('./google')

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser((_id, done) => {
        db.User.findById(_id)
        .then(user => done(null, user))
        .catch(err => done(err))
    })

    local()
    kakao()
    naver()
    google()
}