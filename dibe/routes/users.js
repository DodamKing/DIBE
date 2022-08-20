var express = require('express');
var router = express.Router();
const db = require('../models')
const passport = require('passport')
const bcrypt = require('bcrypt');
const { isNotLoggedIn, isLoggedIn, getCurrentDate } = require('./middlewares');

/* GET users listing. */
router.get('/sns_login', isNotLoggedIn, (req, res) => {
  res.render('user/sns_login')
})

router.get('/login', isNotLoggedIn, (req, res) => {
  const _title = 'DIBE 로그인'
  const loginError = req.query.loginError
  res.render('user/login', {
    _title : _title,
    loginError,
  })
})

router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) return next(authError)
    if (!user) return res.redirect(`/users/login?loginError=${info.message}`)
    return req.login(user, async (loginError) => {
      if (loginError) return next(loginError)
      const result = await db.User.findByIdAndUpdate(user._id, {visitedAt : new Date()})
      res.redirect('/')
    })
  })(req, res, next)
})

router.get('/signup', isNotLoggedIn, (req, res) => {
  res.render('user/signup')
})

router.post('/signup', isNotLoggedIn, async (req, res, next) => {
  const user = req.body
  const hash = await bcrypt.hash(user.pwd, 12)
  user.pwd = hash
  db.User.create(user, (err) => {
    if (err) return next(err)
    res.redirect('/')
  })
})

router.get('/overlapcheck', (req, res) => {
  const userId = req.query.userId
  db.User.findOne({userId : userId}, (err, data) => {
    if (err) {
      res.json(err)
      return
    }
    const result = data ? 1 : 0
    res.render('user/overlapcheck', {
      userId : userId,
      result : result,
    })
  })
})

router.get('/kakao', passport.authenticate('kakao'))

router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect : '/',
}), async (req, res) => {
  const _id = req.user._id
  await db.User.findByIdAndUpdate(_id, {visitedAt : new Date()})
  res.redirect('/')
})

router.get('/naver', passport.authenticate('naver', {authType : 'reprompt'}))

router.get('/naver/callback', passport.authenticate('naver', {
  failureRedirect : '/',
}), async (req, res) => {
  const _id = req.user._id
  await db.User.findByIdAndUpdate(_id, {visitedAt : new Date()})
  res.redirect('/')
})

router.get('/logout', isLoggedIn, (req, res) => {
  req.logout((err) => {
    if (err) return console.error(err)
    req.session.destroy()
    res.redirect('/')
  })
})

router.get('/profile/:_id', isLoggedIn, async (req, res) => {
  const _id = req.params._id
  const user = await db.User.findById(_id)
  const msg = req.flash('msg')
  res.render('user/profile', {user, msg})
})

router.get('/withdrawal/:_id', isLoggedIn, async (req, res) => {
  const _id = req.params._id
  const result = await db.User.findByIdAndUpdate(_id, {del : true})
  console.log(result)
  res.redirect('/users/logout')
})

router.get('/pwdcha/:_id', isLoggedIn, (req, res) => {
  const msg = req.flash('msg')
  res.render('user/pwdcha', {msg})
})

router.post('/pwdcha/:id', isLoggedIn, async (req, res) => {
  const _id = req.user._id
  const pwd = req.user.pwd
  const pwd1 = req.body.pwd1
  const pwd2 = await bcrypt.hash(req.body.pwd2, 12) 
  const check = await bcrypt.compare(pwd1, pwd)
  if (check) {
    await db.User.findByIdAndUpdate(_id, {pwd : pwd2})
    req.flash('msg', '비밀번호가 정상적으로 변경 되었습니다.')
    res.redirect('/users/profile/' + _id)
  }
  else {
    req.flash('msg', '기존 비밀번호가 틀립니다.')
    res.redirect('/users/pwdcha/' + _id)
  }
})

router.get('/update', isLoggedIn, (req, res) => {
  const msg = req.flash('msg')
  res.render('user/update', {msg})
})

router.post('/update', isLoggedIn, async (req, res) => {
  const _id = req.user._id
  const email = req.body.email
  const telecom = req.body.telecom
  const phoneNb = req.body.phoneNb
  const userNm = req.body.userNm
  const nickNm = req.body.nickNm
  await db.User.findByIdAndUpdate(_id, {email, telecom, phoneNb, userNm, nickNm})
  req.flash('msg', '정보가 정상적으로 변경 되었습니다.')
  res.redirect('/users/update')
})

module.exports = router;
