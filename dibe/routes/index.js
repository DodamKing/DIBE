var express = require('express');
var router = express.Router();
const db = require('../models')
const fs = require('fs')
const request = require('request')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'DIBE' });
});

router.get('/chart', (req, res) => {
  const _id = []
  const isFile = []
  const url = process.env.CHART_API_URL
  request(url, async (err, response, body) => {
      if (err) return res.json(err)
      const data = JSON.parse(body)
      for (let i=0; i<data.title.length; i++) {
        const title = data.title[i]
        const artist = data.artist[i]
        const result = await db.Song.findOne({title : title, artist : artist})
        if (result) {
          _id.push(result._id)
          isFile.push(result.isFile)
        }
        else {
          db.Song.create({
            title : title,
            artist : artist,
            img : data.img[i],
            album : data.album[i],
          })
          _id.push(await db.Song.findOne({title : title, artist : artist}))
          isFile.push(0)
        }
      }
      data._id = _id
      data.isFile = isFile

      const date = new Date()
      const today = date.toLocaleDateString()

      res.render('chart', {data, today})
  })
  // db.Chart.find((err, result) => {
  //   if (err) return res.json(err)
  //   res.render('chart', {data : result})
  // })
})

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
