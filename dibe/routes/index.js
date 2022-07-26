var express = require('express');
var router = express.Router();
const db = require('../models')
const fs = require('fs')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'DIBE' });
});

router.get('/audio/test', async (req, res) => {
  const audio_id = '62df9589c0102ae446534380' // somebody!
  const cloud_url = 'https://works.do/56gcLjD'
  res.render('play-test', {
    audio_id : audio_id,
    cloud_url : cloud_url,
  })
})

router.get('/audio/stream', (req, res) => {
  const _id = '62df9589c0102ae446534381' // 그그그
  
  res.set({
    'Content-Type' : 'audio/mp3',
    'Transfer-Encoding' : 'chunked',
  })
  
  fs.readFile('public/video/' + _id + '.mp4', (err, stream) => {
    if (err) return console.error(err)
    res.send(stream)
  })
})


module.exports = router;
