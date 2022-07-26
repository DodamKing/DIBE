const express = require('express')
const router = express.Router()
const db = require('../models')
const fs = require('fs')
const request = require('request')
const ytdl = require('ytdl-core')
const { response, json } = require('express')

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

            db.Song.create({
                title : title,
                artist : artist,
                img : img,
                album : album,
            }, (err, result) => {
                if(err) return console.error(err)
            })
        }
        
        res.json(data)
    })
})

router.post('/downs/local', (req, res) => {
    const url = process.env.SONG_TO_DB_URL
    request(url, (err, response, body) => {
        const data = JSON.parse(body)
        const rows = []
        for (let i=0; i<data.title.length; i++) {
            const title = data.title[i]
            const artist = data.artist[i]
    
            db.Song.find({ title : title, artist : artist }, (err, result) => {
                if (err) return console.error(err)
                if (result) {
                    const _id = result[0]._id
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
                const isFile = result.isFile

                db.Chart.create({
                    title : title,
                    artist : artist,
                    img : img,
                    isFile : isFile,
                }, (err, a) => {
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
    res.render('song/player')
})

module.exports = router