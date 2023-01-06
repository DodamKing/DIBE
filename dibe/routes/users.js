var express = require('express');
var router = express.Router();
const db = require('../models')
const passport = require('passport')
const bcrypt = require('bcrypt');
const { isNotLoggedIn, isLoggedIn, getCurrentDate } = require('./middlewares');
const myModule = require('../public/javascripts/myModule');

/* GET users listing. */
router.get('/sns_login', isNotLoggedIn, (req, res) => {
  res.render('user/sns_login')
})

router.get('/login', isNotLoggedIn, (req, res) => {
  const _title = 'DIBE 로그인'
  const loginError = req.flash('loginError')
  res.render('user/login', {
    _title : _title,
    loginError,
  })
})

router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) return next(authError)
    if (!user) {
      req.flash('loginError', info.message)
      return res.redirect(`/users/login`)
    } 
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

router.get('/google', passport.authenticate('google', {scope : ['profile', 'email']}))

router.get('/google/callback', passport.authenticate('google', {failureRedirect : '/'}),
async (req, res) => {
  const _id = req.user._id
  await db.User.findByIdAndUpdate(_id, {visitedAt : new Date()})
  res.redirect('/')
  }
)

router.get('/logout',(req, res) => {
  req.logout((err) => {
    if (err) return console.error(err)
    req.session.destroy()
    res.redirect('/')
  })
})

router.get('/profile/:_id', isLoggedIn, async (req, res) => {
  const _id = req.params._id
  const user = await db.User.findById(_id)
  const msg1 = req.flash('msg1')
  const msg2 = req.flash('msg2')
  res.render('user/profile', {user, msg1, msg2})
})

router.get('/withdrawal/:_id', isLoggedIn, async (req, res) => {
  const _id = req.params._id
  const result = await db.User.findByIdAndUpdate(_id, {del : true})
  console.log(result)
  res.redirect('/users/logout')
})

router.get('/pwdcha/:_id', isLoggedIn, (req, res) => {
  const msg1 = req.flash('msg1')
  const msg2 = req.flash('msg2')
  res.render('user/pwdcha', {msg1, msg2})
})

router.post('/pwdcha/:id', isLoggedIn, async (req, res) => {
  const _id = req.user._id
  const pwd = req.user.pwd
  const pwd1 = req.body.pwd1
  const pwd2 = await bcrypt.hash(req.body.pwd2, 12) 
  const check = await bcrypt.compare(pwd1, pwd)
  if (check) {
    await db.User.findByIdAndUpdate(_id, {pwd : pwd2})
    req.flash('msg1', '비밀번호가 정상적으로 변경 되었습니다. \\n다시 로그인 하세요.')
    res.redirect('/users/profile/' + _id)
  }
  else {
    req.flash('msg2', '기존 비밀번호가 틀립니다.')
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

router.get('/playlist', isLoggedIn, async (req, res) => {
  const userId = req.user._id
  const playList = await db.PlayList.find({userId})
  const thums = []

  for (const item of playList) {
    const thum = {}
    if (item.content) {
      const songIds = item.content.split('/').slice(0, -1)
      if (songIds.length >= 4) {
        thum.thum1 = (await db.Song.findById(songIds[0])).img.replace('50', '100')
        thum.thum2 = (await db.Song.findById(songIds[1])).img.replace('50', '100')
        thum.thum3 = (await db.Song.findById(songIds[2])).img.replace('50', '100')
        thum.thum4 = (await db.Song.findById(songIds[3])).img.replace('50', '100')
      }
      else if (songIds.length == 3) {
        thum.thum1 = (await db.Song.findById(songIds[0])).img.replace('50', '100')
        thum.thum2 = (await db.Song.findById(songIds[1])).img.replace('50', '100')
        thum.thum3 = (await db.Song.findById(songIds[2])).img.replace('50', '100')
        thum.thum4 = ''
      }
      else if (songIds.length == 2) {
        thum.thum1 = (await db.Song.findById(songIds[0])).img.replace('50', '100')
        thum.thum2 = (await db.Song.findById(songIds[1])).img.replace('50', '100')
        thum.thum3 = ''
        thum.thum4 = ''
      }
      else if (songIds.length == 1) {
        thum.thum1 = (await db.Song.findById(songIds[0])).img.replace('50', '200')
        thum.thum2 = ''
        thum.thum3 = ''
        thum.thum4 = ''
      }
    }
    thums.push(thum)
  }

  res.json({playList, thums})
})

router.get('/playlist/:listId', isLoggedIn, async (req, res) => {
  const listId = req.params.listId
  const playList = await db.PlayList.findById(listId)
  const thums = {}
  const songs = []

  if (playList.content) {
    const songIds = playList.content.split('/').slice(0, -1)
    if (songIds.length >= 4) {
      thums.thum1 = (await db.Song.findById(songIds[0])).img.replace('50', '100')
      thums.thum2 = (await db.Song.findById(songIds[1])).img.replace('50', '100')
      thums.thum3 = (await db.Song.findById(songIds[2])).img.replace('50', '100')
      thums.thum4 = (await db.Song.findById(songIds[3])).img.replace('50', '100')
    }
    else if (songIds.length == 3) {
      thums.thum1 = (await db.Song.findById(songIds[0])).img.replace('50', '100')
      thums.thum2 = (await db.Song.findById(songIds[1])).img.replace('50', '100')
      thums.thum3 = (await db.Song.findById(songIds[2])).img.replace('50', '100')
      thums.thum4 = ''
    }
    else if (songIds.length == 2) {
      thums.thum1 = (await db.Song.findById(songIds[0])).img.replace('50', '100')
      thums.thum2 = (await db.Song.findById(songIds[1])).img.replace('50', '100')
      thums.thum3 = ''
      thums.thum4 = ''
    }
    else if (songIds.length == 1) {
      thums.thum1 = (await db.Song.findById(songIds[0])).img.replace('50', '200')
      thums.thum2 = ''
      thums.thum3 = ''
      thums.thum4 = ''
    }

    for (const id of songIds) {
      const song = await db.Song.findById(id)
      songs.push(song)
    }
  }

  res.json({playList, thums, songs})
})

router.post('/savelist', isLoggedIn, async (req, res) => {
  const userId = req.user._id
  const listNm = req.body.listNm
  const comment = req.body.comment
  const content = req.body.content

  await db.PlayList.create({userId, listNm, comment, content})
  res.end()
})

router.post('/updatelist', isLoggedIn, async (req, res) => {
  const listId = req.body.listId
  const songIds = req.body.songIds
  const list = await db.PlayList.findById(listId)
  let content = list.content

  for (const id of songIds) {
    if (!content.includes(id)) content += id + '/'
  }
  await db.PlayList.findByIdAndUpdate(listId, {content})
  res.end()
})

router.get('/dellist/:listId', isLoggedIn, async (req, res) => {
  const listId = req.params.listId

  await db.PlayList.findByIdAndDelete(listId)

  res.end()
})

router.get('/dellistsong/:listId', isLoggedIn, async (req, res) => {
  const listId = req.params.listId
  const songId = req.query.songId
  const songIds = req.query.songIds
  const playlist = await db.PlayList.findById(listId)
  const content = playlist.content

  if (!songIds) await db.PlayList.findByIdAndUpdate(listId, {content : content.replace(songId + '/', '')})
  else if (!songId) {
    let content_ = content
    for await (const id of songIds.split(',')) { 
      content_ = content_.replace(id + '/', '')
    }
    await db.PlayList.findByIdAndUpdate(listId, {content : content_})
  }
  
  res.end()
})

router.post('/finduserId', async (req, res) => {
  const userNm = req.body.userNm
  const phoneNb = req.body.phoneNb
  const email = req.body.email

  const user = await db.User.findOne({userNm, phoneNb, email})
  let mid = ''
  if (user) mid = user.userId
  res.send(mid)
})

router.post('/finduserPwd', async (req, res) => {
  const userId = req.body.userId
  const email = req.body.email
  
  const user = await db.User.findOne({userId, del : false})
  if (!user) return res.send('0')
  else if (user.email !== email) return res.send('2')
  else {
    const pwd_ = Math.random().toString(36).slice(2)
    const pwd = await bcrypt.hash(pwd_, 12)
    await db.User.findOneAndUpdate({userId}, {pwd})
    await myModule.nodemail(email, pwd_, user)
    return res.send('1')
  }
})

module.exports = router;
