const express = require('express')
const router = express.Router()
const db = require('../models')
const moment = require('moment')
const ytdl = require('ytdl-core')
const fs = require('fs')
const request = require('request')
const myModule = require('../public/javascripts/myModule')

const isAdmin = (req, res, next) => {
    const user = req.user
    if (user && user.userId === 'admin') next()  
    else res.redirect('/users/login')
}

router.get('/index', isAdmin, async (req, res) => {
    const songs = []
    const reports = await db.Report.find().sort({createdAt : -1})
    res.render('admin/index', {reports})
})

router.get('/users', isAdmin, async (req, res) => {
    const users = await db.User.find().sort('-_id')
    res.render('admin/user', {users, moment})
})

router.get('/songs', isAdmin, async (req, res) => {
    res.render('admin/song')
})

router.post('/songs', isAdmin, async (req, res) => {
    const query = req.body.query
    const songs = await db.Song.find({$or : [{title : {$regex : query, $options : 'i'}}, {artist : {$regex : query, $options : 'i'}}]})
    res.render('admin/song', {songs})
})

router.get('/update/:songId', isAdmin, async (req, res) => {
    const songId = req.params.songId
    const song = await db.Song.findById(songId)
    const path = `public/video/${songId}.mp4`
    const exists = await fs.existsSync(path)
    res.render('admin/update', {song, exists})
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

router.get('/testYtUrl', (req, res) => {
    myModule.resetWrongYtURL()
})

router.get('/setYtUrl', async (req, res) => {
    const results = await myModule.setWrongYtURL()
    res.json({results})
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

router.post('/report', async (req, res) => {
    const songId = req.body.songId
    const song = await db.Song.findById(songId)
    const title = song.title
    const artist = song.artist
    const content = req.body.content
    db.Report.create({songId, title, artist, content})
})

router.get('/reportdel/:reportId', async (req, res) => {
    const reportId = req.params.reportId
    await db.Report.findByIdAndDelete(reportId)
    res.redirect('/admin/index')
})

module.exports = router