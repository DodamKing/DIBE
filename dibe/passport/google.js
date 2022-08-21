const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const db = require('../models')

module.exports = () => {
    passport.use(new GoogleStrategy({
        clientID : process.env.GOOGLE_ID,
        clientSecret : process.env.GOOGLE_SECRET,
        callbackURL : '/users/google/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        console.log('google profile : ', profile)
        try {
            const user = await db.User.findOne({snsId : profile.id, provider : 'google'})
            if (user) done(null, user)
            else {
                const newUser = await db.User.create({
                    email : profile.emails[0].value,
                    nickNm : profile.displayName,
                    snsId : profile.id,
                    provider : 'google',
                })
                done(null, newUser)
            }
        } catch (err) {
            console.error(err)
            done(err)
        }
    }))
}