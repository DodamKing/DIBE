const express = require('express')
const router = express.Router()
const db = require('../models')
const fs = require('fs')
const request = require('request')
const ytdl = require('ytdl-core')
const { chooseFormat } = require('ytdl-core')

router.get('/chart', (req, res) => {
    const url = 'http://127.0.0.1:8080/chart'
    request(url, (err, response, body) => {
        if (err) return res.json(err)
        res.json(JSON.parse(body))
    })
})

router.get('/getYtStream', async (req, res) => {
    const list = [
        "https://www.youtube.com/watch?v=Nl6ThTbJz1M", 
        "https://www.youtube.com/watch?v=LaD0URNK_9s"
    ]

    res.set({
    'Content-Type' : 'audio/mp3',
    'Transfer-Encoding' : 'chunked',
    })
    
    ytdl(list[1]).pipe(fs.createWriteStream('test.mp4').on('finish', () => {
        fs.readFile('test.mp4', (err, test) => {
            if (err) return console.error(err)
            res.send(test)
        })
        
        if (fs.existsSync('test.mp4')) {
            fs.unlinkSync('test.mp4')
        }
    }))
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
    // const title = req.body.title
    // const artist = req.body.artist
    // const fileName = title + ' - ' + artist + '.mp3'
    // const path = 'public/video/' + fileName

    const url = 'http://127.0.0.1:8080/down'
    request(url, (err, response, body) => {
        if (err) return res.json(err)

        const audio = youtubedl(body[0])
        console.log(audio);
    })

    // fs.readFile(path, (err, file) => {
    //     if (err) return res.json(err)
        
    //     data.file = file
    //     db.Song.create(data, (err, result) => {
    //         if (err) return res.json(err)
    //         res.json(result)
    //     })
    // })
    
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