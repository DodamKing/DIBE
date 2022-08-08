var express = require('express');
var router = express.Router();
const db = require('../models')
const passport = require('passport')
const bcrypt = require('bcrypt');
const { isNotLoggedIn, isLoggedIn } = require('./middlewares');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/list', async (req, res) => {
  const result = await db.User.find()
  console.log(result);
  res.json(result)
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
    return req.login(user, (loginError) => {
      if (loginError) return next(loginError)
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
}), (req, res) => {
  res.redirect('/')
})

router.get('/logout', isLoggedIn, (req, res) => {
  req.logout((err) => {
    if (err) return console.error(err)
    req.session.destroy()
    res.redirect('/')
  })
})

module.exports = router;
