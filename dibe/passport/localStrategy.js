const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const db = require('../models')

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField : 'userId',
        passwordField : 'pwd',
    }, async (userId, pwd, done) => {
        try {
            const user = await db.User.findOne({userId : userId, del : false})
            if (user) {
                const check = await bcrypt.compare(pwd, user.pwd)
                if (check) done(null, user)
                else done(null, false, {message : '비밀번호가 일치하지 않습니다.'})
            }
            else done(null, false, {message : '가입되지 않은 회원입니다.'})
        }
        catch (err) {
            console.error(err)
            done(err)
        }
    }))
}