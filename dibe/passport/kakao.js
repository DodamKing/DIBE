const passport = require('passport')
const kakao = require('passport-kakao').Strategy
const db = require('../models')

module.exports = () => {
    passport.use(new kakao({
        clientID : process.env.KAKAO_ID,
        callbackURL : '/users/kakao/callback',
    }, async (accessToken, refreshToken, profile, done) =>{
        console.log('kakao profile : ' + JSON.stringify(profile))
        try {
            const user = await db.User.findOne({snsId : profile.id, provider : 'kakao', del : false})
            if (user) done(null, user)
            else {
                const newUser = await db.User.create({
                    email : profile._json.kakao_account.email,
                    nickNm : profile.displayName,
                    snsId : profile.id,
                    provider : 'kakao',
                })
                done(null, newUser)
            }
        } catch (err) {
            console.error(err)
            done(err)
        }
    }))
}