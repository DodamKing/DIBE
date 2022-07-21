var express = require('express');
var router = express.Router();
const db = require('../models')
const fs = require('fs')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'DIVE' });
});

router.get('/audio/test', (req, res) => {
  const _title = 'play_test'
  const title = 'BEAUTIFUL MONSTER'
  const artist = 'STAYC(스테이씨)'
  const fileName = title + ' - ' + artist
  const url = `/e/${title} - ${artist}.mp3`

  const _id = '62d91278552d5ec2236d6e49'
  const song = db.Song.findById(_id)
  const file = song.file

  res.render('play-test', {
    title : _title,
    fileName : fileName,
    url : url,
    file : file,
  })
})

module.exports = router;
