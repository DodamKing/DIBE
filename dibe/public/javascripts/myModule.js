const request = require('request')
const db = require('../../models')
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
                await db.Chart.findOneAndUpdate(songs[i].title, songs[i].artist, {ytURL : body[i]})
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
                await db.Song.create({ title, artist, img, album })
                await db.Chart.create({songId, title, artist, img})
            }
        }

    })
}

myModule.setURLScheduler = setURLScheduler
myModule.setTodayChart = setTodayChart

module.exports = myModule