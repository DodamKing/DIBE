const express = require('express')
const router = express.Router()
const db = require('../models')
const moment = require('moment')
const ytdl = require('ytdl-core')
const fs = require('fs')
const request = require('request')

router.get('/index', (req, res) => {
    res.render('admin/index')
})

router.get('/users', async (req, res) => {
    const users = await db.User.find().sort('-_id')
    res.render('admin/user', {users, moment})
})

router.get('/songs', async (req, res) => {
    res.render('admin/song')
})

router.post('/songs', async (req, res) => {
    const query = req.body.query
    const songs = await db.Song.find({$or : [{title : {$regex : query, $options : 'i'}}, {artist : {$regex : query, $options : 'i'}}]})
    res.render('admin/song', {songs})
})

router.get('/update/:songId', async (req, res) => {
    const songId = req.params.songId
    const song = await db.Song.findById(songId)
    res.render('admin/update', {song})
})

router.post('/update/:songId', async (req, res) => {
    const songId = req.params.songId
    await db.Song.findByIdAndUpdate(songId, req.body)
    res.redirect(`/admin/update/${songId}`)
})

router.post('/downsong', async (req, res) => {
    const _id = req.body._id
    const url = req.body.url
    await ytdl(url, {filter : 'audioonly'}).pipe(fs.createWriteStream('public/video/' + _id + '.mp4').on('finish', () => {
        db.Song.findByIdAndUpdate(_id, {isFile : 1}, (err) => {
            if (err) return console.error(err)
        })
    }))
    res.send(true)
})

router.post('/preview', async (req, res) => {
    const url = req.body.url
    
    res.set({
        'Content-Type' : 'audio/mp4',
        'Transfer-Encoding' : 'chunked',
    })

    ytdl(url, {filter : 'audioonly'}).pipe(res)
})

router.get('/setYtUrl', async (req, res) => {
    const url = process.env.URL_GET_URL
    const songs = []
    const results = []
    const rows = await db.Song.find()
    for (row of rows) {
        if (!row.ytURL) {
            songs.push(row)
        }
    }
    
    const options = {
        uri : url,
        method : 'POST',
        body : {songs},
        json : true,
    }
    request.post(options, async (err, response, body) => {
        for (let i=0; i<body.length; i++) {
            console.log(body[i]);
            await db.Song.findByIdAndUpdate(songs[i]._id, {ytURL : body[i]})
            const result = await db.Song.findById(songs[i]._id)
            results.push(result)

            if (i === body.length-1) {
                console.log(results)
                res.json({results})
            }
        }
    })
})

router.get('/getYtUTL', async (req, res) => {
    const songId = req.query.songId
    const song = await db.Song.findById(songId)
    const songs = []
    songs.push(song)
    const url = process.env.URL_GET_URL

    const options = {
        uri : url,
        method : 'POST',
        body : {songs},
        json : true,
    }
    request.post(options, async (err, response, body) => {
        res.json(body)
    })
})

module.exports = router