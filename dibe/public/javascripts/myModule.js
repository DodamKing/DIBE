const request = require('request')
const db = require('../../models')
const fs = require ('fs')
const ytdl = require('ytdl-core')
const myModule = {}

function setURLScheduler() {
    return new Promise(async (resolve, reject) => {
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
                await db.Song.findByIdAndUpdate(songs[i]._id, {ytURL : body[i]})
                await db.Chart.findOneAndUpdate({songId : songs[i]._id}, {ytURL : body[i]})
                const result = await db.Song.findById(songs[i]._id)
                results.push(result)
            }
            resolve(results)
        })
    })
}

function setTodayChart() {
    const url = process.env.CHART_API_URL
    request(url, async (err, response, body) => {
        if (err) return console.error(err)
        const data = JSON.parse(body)
        
        await db.Chart.deleteMany({})

        for (let i=0; i<data.title.length; i++) {
            const title = data.title[i]
            const artist = data.artist[i]
            const img = data.img[i]
            const album = data.album[i]

            const result = await db.Song.findOne({title, artist})

            if (result) {
                const songId = result._id
                const isFile = result.isFile
                const ytURL = result.ytURL
                await db.Chart.create({songId, title, artist, img, isFile, ytURL})
            } else {
                const song = await db.Song.create({ title, artist, img, album })
                await db.Chart.create({songId : song._id, title, artist, img})
            }
        }

    })
}

async function downSongsFile() {
    const result = await db.Song.find()

    for (const song of result) {
        const songId = song._id
        const path = `public/video/${songId}.mp4`
        const exists = await fs.existsSync(path)
        const url = song.ytURL

        if (!exists && url) {
            ytdl(url, {filter : 'audioonly'}).pipe(fs.createWriteStream(path).on('finish', () => {
                console.log(song.title, song.artist)
                db.Song.findByIdAndUpdate(songId, {isFile : 1}, (err) => {
                    if (err) return console.error(err)
                })
            }))
        }
    }
}

async function delSongsFile() {
    const result = await db.Song.find()

    for (const song of result) {
        const songId = song._id
        const path = `public/video/${songId}.mp4`
        const stats = fs.statSync(path)
        if (stats.size === 0) fs.unlinkSync(path)
    }
    
}

async function reportWrongYtURL() {
    const songs = await db.Song.find()

    for await (const song of songs) {
        const ytURL = song.ytURL
        if (!ytURL) continue
        ytdl(ytURL).on('error', async () => {
            const content = `유튜브 url 확인 바람. 관리자`
            db.Report.create({songId : song._id, title : song.title, artist : song.artist, content})
        })
    }

    const result = new Date().toLocaleString() + ', 잘못된 주소 기록'
    return result
}

async function resetWrongYtURL() {
    const songs = await db.Song.find()

    for await (const song of songs) {
        ytdl(song.ytURL).on('error', async () => {
            console.log('잘못된 url :', song.ytURL, song.title, song.artist)
            await db.Song.findByIdAndUpdate(song._id, {ytURL : ''})
            await db.Chart.findOneAndUpdate({songId : song._id}, {ytURL : ''})
        })
    }
}

async function setWrongYtURL() {
    const result = await db.Song.find()
    const uri = process.env.URL_GET_URL
    const songs = []
    
    for await (const song of result) {
        const url = song.ytURL
        if (!url) {
            console.log('잘못된 url :', url, song.title, song.artist)
            songs.push(song)
        }
    }
    
    const options = {
        uri : uri,
        method : 'POST',
        body : {songs},
        json : true,
    }

    request.post(options, async (err, response, body) => {
        if (response.statusCode === 200) {
            for (let i=0; i<songs.length; i++) {
                console.log('새로운 url :', body[i])
                await db.Song.findByIdAndUpdate(songs[i]._id, {ytURL : body[i]})
                await db.Chart.findOneAndUpdate({songId : songs[i]._id}, {ytURL : body[i]})
            }
        }
        else console.log('api 오류')
    })

    return songs
}

async function setRyrics() {
    return new Promise(async (resolve, reject) => {
        const songs = []
        const result = await db.Song.find()
        for (const song of result) {
            const lyrics = song.lyrics
            if (!lyrics) {
                songs.push(song)
            }
        }
    
        const uri = process.env.LYRICS_POST_URL
        const options = {
            uri : uri,
            method : 'POST',
            body : {songs},
            json : true,
        }
    
        request.post(options, async (err, response, body) => {
            for (const song of body) {
                const songId = song._id
                await db.Song.findByIdAndUpdate(songId, {write : song.작곡, words : song.작사, arrange : song.편곡, lyrics : song.가사})
            }
            resolve(body)
        })
    })
}

myModule.setURLScheduler = setURLScheduler
myModule.setTodayChart = setTodayChart
myModule.downSongsFile = downSongsFile
myModule.delSongsFile = delSongsFile
myModule.setWrongYtURL = setWrongYtURL
myModule.setRyrics = setRyrics
myModule.resetWrongYtURL = resetWrongYtURL
myModule.reportWrongYtURL = reportWrongYtURL

module.exports = myModule