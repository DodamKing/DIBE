var express = require('express');
var router = express.Router();
const db = require('../models')
const fs = require('fs')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'DIBE' });
});

router.get('/audio/test', async (req, res) => {
  const _title = 'play_test'
  const title = 'BEAUTIFUL MONSTER'
  const artist = 'STAYC(스테이씨)'
  const fileName = title + ' - ' + artist
  const url = `/e/${title} - ${artist}.mp3`
  
  res.render('play-test', {
    title : _title,
    fileName : fileName,
    url : url,
  })
})

router.get('/audio/stream', (req, res) => {
  const _id = '62dad3ab9f4b21f4421d5453' // 그그그
  // const _id = '62dad174b0fab3d96cacd363' // 보고싶었어
  
  res.set({
    'Content-Type' : 'audio/mp3',
    'Transfer-Encoding' : 'chunked',
  })

  db.Song.findById(_id, (err, data) => {
    if (err) return console.log(err)
    res.send(data.file)
  })
})

module.exports = router;
