const express = require('express')
const router = express.Router()
const db = require('../models')
const fs = require('fs')
const request = require('request')
const ytdl = require('ytdl-core')

router.get('/chart', (req, res) => {
    const url = process.env.CHART_API_URL
    request(url, (err, response, body) => {
        if (err) return res.json(err)
        res.json(JSON.parse(body))
    })
})

router.get('/set/song', async (req, res) => {
    const url = process.env.CHART_API_URL
    request(url, (err, response, body) => {
        if (err) return res.json(err)
        
        const data = JSON.parse(body)

        for (let i=0; i<data.title.length; i++) {
            const title = data.title[i]
            const artist = data.artist[i]
            const img = data.img[i]
            const album = data.album[i]

            db.Song.findOne({title : title, artist : artist}, (err, result) => {
                if(err) return console.error(err)
                if (!result) {
                    db.Song.create({
                        title : title,
                        artist : artist,
                        img : img,
                        album : album,
                    }, (err) => {
                        if(err) return console.error(err)
                    })
                }
            })

        }
        res.json(data)
    })
})

router.get('/downs/local', async (req, res) => {
    const url = process.env.URL_GET_URL
    const songs = []
    const rows = await db.Song.find()
    for (row of rows) {
        if (row.isFile === 0)  {
            songs.push(row)
        }
    }
    
    const options = {
        uri : url,
        method : 'POST',
        body : {songs},
        json : true,
    }
    request.post(options, (err, response, body) => {
        for (let i=0; i<body.length; i++) {
            ytdl(body[i], {filter : 'audioonly'}).pipe(fs.createWriteStream('public/video/' + songs[i]._id + '.mp4').on('finish', () => {
                db.Song.findByIdAndUpdate(songs[i]._id, {isFile : 1}, (err) => {
                    if (err) return console.error(err)
                })
            }))
        }
    })
    
    res.json({songs})
})

router.get('/set/chart', (req, res) => {
    const url = process.env.CHART_API_URL
    request(url, (err, response, body) => {
        if (err) return console.error(err)
        const data = JSON.parse(body)
        
        for (let i=0; i<data.title.length; i++) {
            const title = data.title[i]
            const artist = data.artist[i]
            const img = data.img[i]

            db.Song.find({title : title, artist : artist}, (err, result) => {
                if (err) return console.error(err)
                const songId = result._id
                const isFile = result.isFile

                db.Chart.create({
                    songId : songId,
                    title : title,
                    artist : artist,
                    img : img,
                    isFile : isFile,
                }, (err) => {
                    if (err) return console.error(err)
                })
            })
        }
    })
})

router.get('/list', async (req, res) => {
    try {
        const result = await db.Song.find()
        res.json(result)
    } catch (err) {
        console.error(err)
    }
})

router.delete('/delete/:_id', async  (req, res) => {
    try {
        const _id = req.params._id
        const result = await db.Song.findByIdAndDelete(_id)
        res.json(result)
    } catch (err) {
        console.error(err)
    }
})

router.get('/direct', (req, res) => {
    const songId = req.query.songId
    const autoPlay = req.query.autoPlay

    db.Song.findById(songId, (err, song) => {
        if (err) return console.error(err)
        const songs = [song]
        res.render('song/player', {songs, autoPlay})
    })
})

router.get('/stream', (req, res) => {
    const songId = req.query.songId

    res.set({
        'Content-Type' : 'audio/mp4',
        'Transfer-Encoding' : 'chunked',
    })
    
    fs.ReadStream('public/video/' + songId + '.mp4').pipe(res)
})

router.get('/addsong', async (req, res) => {
    const songId = req.query.songId
    const song = await db.Song.findById(songId)
    res.json({song})
})

router.post('/addsongs', async (req, res) => {
    const songs = []
    const songIds = req.body.songIds
    for (let i=0; i<songIds.length; i++) {
        const song = await db.Song.findById(songIds[i])
        songs.push(song)
        if (i === songIds.length-1) res.json({songs})
    }
})

router.get('/open_player', async (req, res) => {
    const autoPlay = 0
    const songId = req.query.songId
    const song = await db.Song.findById(songId)
    const songs = [song]
    res.render('song/player', {autoPlay, songs})
})

router.post('/open_player', async (req, res) => {
    const songs = []
    const autoPlay = 0
    // const reqSongIds = req.body.songIds
    const songIds = req.body.songIds.split(',')
    for (songId of songIds) {
        const song = await db.Song.findById(songId)
        songs.push(song)
    }
    res.render('song/player', {autoPlay, songs})
})

module.exports = router