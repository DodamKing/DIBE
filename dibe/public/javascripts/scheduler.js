const request = require('request')
const db = require('../../models')
const test = {}

function cronTest() {
    const now = new Date()
    console.log(`${now.toLocaleString()} 스케줄러 작동`);
}

function getYTUrl() {
    return new Promise(async (resolve, reject) => {
        const url = process.env.URL_GET_URL
        const songs = []
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
            resolve(body)
        })

    })
}

test.cronTest = cronTest
test.getYTUrl = getYTUrl

module.exports = test