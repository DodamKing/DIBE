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
                const result = await db.Song.findById(songs[i]._id)
                results.push(result)
            }
            resolve(results)
        })
    })
}

myModule.setURLScheduler = setURLScheduler

module.exports = myModule