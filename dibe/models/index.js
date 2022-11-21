const Song = require('./Song')
const User = require('./User')
const Chart = require('./Chart')
const playCnt = require('./PlayCnt')
const report = require('./Report')

const db = {}

db.Song = Song
db.User = User
db.Chart = Chart
db.playCnt = playCnt
db.Report = report

module.exports = db