const express = require('express')
const router = express.Router()
const db = require('../models')
const fs = require('fs')
const request = require('request')
const ytdl = require('ytdl-core')
const { response } = require('express')

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

router.get('/downs/local', (req, res) => {
    const url = process.env.SONG_TO_DB_URL
    request(url, (err, response, body) => {
        const data = JSON.parse(body)
        // const data = req.body
        const rows = []
        for (let i=0; i<data.title.length; i++) {
            const title = data.title[i]
            const artist = data.artist[i]
            db.Song.findOne({ title : title, artist : artist }, (err, result) => {
                if (err) return console.error(err)
                if (result) {
                    const _id = result._id
                    if (!result.isFile) {
                        if (data.yt_url[i] === '') return
                        ytdl(data.yt_url[i], {filter : 'audioonly'}).pipe(fs.createWriteStream('public/video/' + _id + '.mp4').on('finish', () => {
                            db.Song.findByIdAndUpdate(_id, {isFile : 1}, (err, row) => {
                                if (err) return console.error(err)
                                rows.push(row)
                            })
                        }))
                    }
                }
            })
        }
        data.rows = rows
        res.json(data)
    })
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

router.get('/direct', async (req, res) => {
    const songId = req.query.songId
    const isFile = req.query.isFile
    const autoPlay = req.query.autoPlay

    // if (isFile === '0') {
    //     const song = await db.Song.findById(songId)
    //     const title = song.title
    //     const artist = song.artist
    //     const options = {
    //         uri : 'http://127.0.0.1:8080/chart/get_yt_url',
    //         method : 'POST',
    //         form : {title, artist},
    //     }
    //     request.post(options, async (err, response, body) => {
    //         if (err) console.error(err)
    //         const temp = await ytdl(body, {filter : 'audioonly'}).pipe(fs.createWriteStream('public/video/' + songId + '.mp4').on('finish', () => {
    //             db.Song.findByIdAndUpdate(songId, {isFile : 1}, (err) => {
    //                 if (err) return console.error(err)
    //             })
    //         }))
    //         db.Song.findById(songId, (err, song) => {
    //             if (err) return console.error(err)
    //             const img1000 = song.img.replace('50', '1000')
    //             const img2000 = song.img.replace('50', '2000')
    //             res.render('song/player', {song, img1000, img2000, autoPlay})
    //         })
    //     })
    // }
    
    db.Song.findById(songId, (err, song) => {
        if (err) return console.error(err)
        const img1000 = song.img.replace('50', '1000')
        const img2000 = song.img.replace('50', '2000')
        res.render('song/player', {song, img1000, img2000, autoPlay})
    })
})

router.get('/stream', (req, res) => {
    const songId = req.query.songId

    res.set({
        'Content-Type' : 'audio/mp3',
        'Transfer-Encoding' : 'chunked',
    })
    
    fs.readFile('public/video/' + songId + '.mp4', (err, stream) => {
        if (err) return console.error(err)
        res.send(stream)
    })
})

module.exports = router