var express = require('express');
var router = express.Router();
const db = require('../models')
const bcrypt = require('bcryptjs')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/list', async (req, res) => {
  const result = await db.User.find()
  console.log(result);
  res.json(result)
})

router.get('/login', (req, res) => {
  res.render('user/login')
})

router.post('/login', async (req, res) => {
  const user = req.body
  if (user.loginCheck === 'on') {
    // 쿠키 설정 자동 로그인 가능하게 하삼
    console.log('맞나');
  }
  console.log(user);

  const pwd = await db.User.find({userId : user.userId})
  const check = await bcrypt.compare(user.pwd, pwd)
  console.log(check);

  if (check) {
    console.log('잘 한듯?');
    res.json('로그인 해주삼')
  }

  res.end()
})

router.get('/signup', (req, res) => {
  res.render('user/signup')
})

router.post('/signup', (req, res) => {
  const user = req.body
  bcrypt.hash(user.pwd, 10, (err, hash) => {
    user.pwd = hash
    db.User.create(user, (err) => {
      if (err) { 
        console.error(err)
        res.redirect('/users/signup')
      }
    })
  })
  res.redirect('/')
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

module.exports = router;
