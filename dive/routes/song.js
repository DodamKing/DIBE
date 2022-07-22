const express = require('express')
const router = express.Router()
const db = require('../models')
const fs = require('fs')

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
    const title = '보고싶었어'
    const artist = 'WSG워너비 (4FIRE)'
    const fileName = title + ' - ' + artist + '.mp3'
    const path = 'e:/music_db/' + fileName
    data.title = title
    data.artist = artist
    
    fs.readFile(path, (err, file) => {
        if (err) return res.json(err)
        
        data.file = file
        db.Song.create(data, (err, result) => {
            if (err) return res.json(err)
            res.json(result)
        })
})
    
    // const readStream = fs.createReadStream(path)
    // const stream = []

    // readStream.on('data', (chunck) => {
        //     stream.push(chunck)
        // })

    // readStream.on('end', async () => {
    //     const file = Buffer.concat(stream)
    //     data.file = file
    //     try {
    //         const result = await db.Song.create(data)
    //         res.json(result)
    //     } catch (err) {
    //         console.error(err)
    //     }
    // })

    // readStream.on('error', (err) => {
    //     console.error(err)
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