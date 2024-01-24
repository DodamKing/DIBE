const request = require('request')
const db = require('../../models')
const fs = require ('fs')
const ytdl = require('ytdl-core')
const axios = require('axios')

const myModule = {}

function setURLScheduler() {
    return new Promise(async (resolve, reject) => {
        const url = process.env.URL_GET_URL
        const songs = []
        const results = []
        const rows = await db.Song.find()
        for (const row of rows) {
            if (!row.ytURL) {
                songs.push(row)
            }
        }

        if (songs.length !== 0) {
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
        }
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
        const exists = fs.existsSync(path)
        const url = song.ytURL

        if (!exists && url) {
            ytdl(url, {filter : 'audioonly'}).on('error', (err) => { return console.error(err)}).pipe(fs.createWriteStream(path).on('finish', () => {
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

function getSongsInfo() {
    console.log(new Date().toLocaleString(), '발매일, 장르 크롤링 시작')
    return new Promise(async (resolve, reject) => {
        const songs = await db.Song.find({$or : [{genre : null}, {genre : ''}]})
        const uri = process.env.SONGINFO_POST_URL
        const options = {
            uri : uri,
            method : 'POST',
            body : {songs},
            json : true,
        }
        
        request.post(options, async (err, response, body) => {
            if (err) return console.error(err)
            for await (const song of body) {
                const songId = song._id
                const _song = await db.Song.findById(songId)
                if (!_song.write && song.작곡) await db.Song.findByIdAndUpdate(songId, {write : song.작곡})
                if (!_song.words && song.작사) await db.Song.findByIdAndUpdate(songId, {words : song.작사})
                if (!_song.arrange && song.편곡) await db.Song.findByIdAndUpdate(songId, {arrange : song.편곡})
                await db.Song.findByIdAndUpdate(songId, { release : song.발매, genre : song.장르 })
            }
            console.log(body)
            console.log(new Date().toLocaleString(), '발매일, 장르 크롤링 종료')
            resolve(body)
        })
    })
}

async function nodemail(email, pwd, user) {
    const nodemailer = require('nodemailer')

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS,
        },
    });

    let info = await transporter.sendMail({
        from: `"DIBE" <${process.env.NODEMAILER_USER}>`,
        to: email,
        subject: 'DIBE 임시 비밀번호',
        html: `<div style='font-size: 150%;'><b>DIBE</b>를 이용해 주셔셔 감사합니다.<br><br>'${user.nickNm}'님의 임시 비밀번호 입니다. <br><br><hr>
            <p style='font-size: 200%; text-align: center;'>${pwd}</p>
            <hr><br>로그인 하셔서 비밀번호를 꼭 변경해 주세요!"
            <br><br><a href='http://112.167.167.27:9000'>DIBE 바로가기</a></div>
        `,
    });

    console.log(info.messageId);
}

const sendTelegramMessage = async (msg) => {
    const botToken = process.env.TELEGRAMBOTTOKEN
    const chatId = process.env.CHATID

    const maxLength = 4900
    let = sendMsg = '서버 에러 발생 \n'
    sendMsg += msg

    if (sendMsg.length > maxLength) sendMsg = sendMsg.substring(0, maxLength)

    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`
        const params = {
            chat_id: chatId,
            text: sendMsg
        }

        const response = await axios.post(url, params)
        const isSuccess = response.data.ok
        if (isSuccess) console.log("성공");
        else console.log("실패");

        return response.data
    }
    catch (err) {
        console.error(err.message)
        return ('실패')
    }
}

myModule.setURLScheduler = setURLScheduler
myModule.setTodayChart = setTodayChart
myModule.downSongsFile = downSongsFile
myModule.delSongsFile = delSongsFile
myModule.setWrongYtURL = setWrongYtURL
myModule.setRyrics = setRyrics
myModule.resetWrongYtURL = resetWrongYtURL
myModule.reportWrongYtURL = reportWrongYtURL
myModule.getSongsInfo = getSongsInfo
myModule.nodemail = nodemail
myModule.sendTelegramMessage = sendTelegramMessage

module.exports = myModule