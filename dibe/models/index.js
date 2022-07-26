const Song = require('./Song')
const User = require('./User')
const Chart = require('./Chart')

const db = {}

db.Song = Song
db.User = User
db.Chart = Chart

module.exports = db