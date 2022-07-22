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
  // const _id = '62da2b3d8f9b1a27bf0502c8' // 그그그
  const _id = '62da65a97d966412f6d035f8' // 보고싶었어
  db.Song.findById(_id, (err, data) => {
    if (err) return console.log(err)

    res.set("content-type", "audio/mp3")
    res.set("accept-ranges", "bytes")

    const {createModel} = require('mongoose-gridfs')
    const {createReadStream} = require('fs')
    const { Readable } = require('stream')

    res.send(data)

    // stream.on('data', (chunk) => {
    //   console.log('data : ', chunk, chunk.length)
    //   res.write(chunk)
    // })
    // stream.on('error', (err) => {
    //   res.json(err)
    // })
    // stream.on('end', () => {
    //   res.end()
    //   console.log('done');
    // })
  })
  

})

module.exports = router;
