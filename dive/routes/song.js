const express = require('express')
const router = express.Router()
const db = require('../models')

router.get('/list', async (req, res) => {
    try {
        const result = await db.Song.find()
        res.json(result)
    } catch (err) {
        console.error(err)
    }
})

router.get('/:_id', async (req, res) => {
    try {
        const _id = req.params._id
        const result = await db.Song.findById(_id)
        console.log(result.title)
        // console.log(result.file)

        const Readable = require('stream').Readable
        let stream = new Readable()
        stream.push(result.file)
        stream.push(null)
        console.log(stream);

        res.json(stream)
    } catch (err) {
        console.error(err)
    }
})

router.post('/upload', async (req, res) => {
    const data = req.body
    try {
        await db.Song.create(data)
        res.json('upsert success!')
    } catch (err) {
        console.error(err)
    }
})

router.post('/upload/test', (req, res) => {
    const data = req.body
    try {
        const fs = require('fs')
        fs.readFile('d:/dd/etc/DIVE/music_db/보고싶었어 - WSG워너비 (4FIRE).mp3', (err, file) => {
            data.file = file
            db.Song.create(data)
            res.json(result)
        })
    } catch (err) {
        console.error(err)
    }
})

router.delete('/delete', async  (req, res) => {
    try {
        const _id = req.query._id
        const result = await db.Song.findByIdAndDelete(_id)
        res.json(result)
    } catch (err) {
        console.error(err)
    }
})

module.exports = router