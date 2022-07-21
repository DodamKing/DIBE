var express = require('express');
var router = express.Router();
const db = require('../models')

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
  const _title = 'Dive 로그인'
  res.render('user/login', {
    _title : _title,
  })
})

router.get('/signup', (req, res) => {
  res.render('user/signup')
})

router.post('/signup', (req, res) => {
  const user = req.body
  db.User.create(user, (err) => {
    if (err) res.json(err)
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
