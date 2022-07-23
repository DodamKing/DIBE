const express = require('express')
const router = express.Router()
const db = require('../models')
const fs = require('fs')
const request = require('request')

router.get('/chart', (req, res) => {
    const url = 'http://127.0.0.1:8080/chart'
    request(url, (err, response, body) => {
        if (err) return res.json(err)
        res.json(JSON.parse(body))
    })
})

router.get('/downLocal', (req, res) => {
    const url = 'http://127.0.0.1:8080/chart'
    request(url, (err, response, body) => {
        if (err) return res.json(err)
        console.log(JSON.parse(body));
        const url = 'http://127.0.0.1:8080/down'
        request(url, (err, response, body) => {
            if (err) return res.json(err)
            res.json(body)
        })

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

router.get('/:_id', async (req, res) => {
    try {
        const _id = req.params._id
        const result = await db.Song.findById(_id)
        console.log(result.file);
        // res.json(result.file)

        // const Readable = require('stream').Readable
        // let stream = new Readable()
        // stream.push(result.file)
        // stream.push(null)
        // res.json(stream)
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
    const title = req.body.title
    const artist = req.body.artist
    const fileName = title + ' - ' + artist + '.mp3'
    const path = 'public/video/' + fileName

    fs.readFile(path, (err, file) => {
        if (err) return res.json(err)
        
        data.file = file
        db.Song.create(data, (err, result) => {
            if (err) return res.json(err)
            res.json(result)
        })
    })
    
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

module.exports = router