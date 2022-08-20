const passport = require('passport')
const {Strategy : NaverStrategy, Profile : NaverProfile} = require('passport-naver-v2')
const db = require('../models')

module.exports = () => {
    passport.use(new NaverStrategy({
        clientID : process.env.NAVER_ID,
        clientSecret : process.env.NAVER_SECRET,
        callbackURL : '/users/naver/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        console.log('naver profile : ' + profile)
        try {
            const user = await db.User.findOne({snsId : profile.id, provider : 'naver'})
            if (user) done(null, user)
            else {
                const newUser = await db.User.create({
                    email : profile.email,
                    phoneNb : profile.mobile,
                    userNm : profile.name,
                    nickNm : profile.nickname,
                    snsId : profile.id,
                    provider : 'naver',
                })
                done(null, newUser)
            }
        } catch (err) {
            console.error(err)
            done(err)
        }
    }))
}