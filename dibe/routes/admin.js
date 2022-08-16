const express = require('express')
const router = express.Router()
const db = require('../models')
const moment = require('moment')

router.get('/', (req, res) => {
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
    const songs = await db.Song.find({$or : [{title : {$regex : query}}, {artist : {$regex : query}}]})
    res.render('admin/song', {songs})
})

router.get('/update', async (req, res) => {
    const songId = req.query.songId
    const song = await db.Song.findById(songId)
    res.render('admin/update', {song})
})

router.post('/update', async (req, res) => {
    console.log(req.body);
    res.redirect('/admin/update?songId=' + req.body._id)
})

router.get('/downsong', async (req, res) => {
    console.log(req.query.url);
})

module.exports = router