const Song = require('./Song')
const User = require('./User')
const Chart = require('./Chart')
const playCnt = require('./PlayCnt')

const db = {}

db.Song = Song
db.User = User
db.Chart = Chart
db.playCnt = playCnt

module.exports = db