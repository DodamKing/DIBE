var express = require('express');
var router = express.Router();
const db = require('../models')
const fs = require('fs')
const request = require('request')
const MobileDetect = require('mobile-detect')

/* GET home page. */
router.get('/', (req, res) => {
	const md = new MobileDetect(req.headers['user-agent'])
	if (md.mobile() && !req.isAuthenticated()) return res.redirect('/users/login')
	else if (md.mobile()) return res.render('mobile/index')
	res.redirect('/index')
})

router.get('/:flag', async (req, res) => {
	const flag = req.params.flag
	const vol = req.cookies.vol
	if (flag === 'index') {
		const md = new MobileDetect(req.headers['user-agent'])
		if (md.mobile() && !req.isAuthenticated()) return res.redirect('/users/login')
		else if (md.mobile()) return res.render('mobile/index')
		res.render('main', { flag, vol })
	}
	else if (flag === 'chart') {
		const _id = []
		const isFile = []
		const ytURL = []
		const url = process.env.CHART_API_URL
		request(url, async (err, response, body) => {
			if (err) return res.json(err)
			const data = JSON.parse(body)
			for (let i=0; i<data.title.length; i++) {
				const title = data.title[i]
				const artist = data.artist[i]
				const result = await db.Song.findOne({title : title, artist : artist})
				if (result) {
					_id.push(result._id)
					isFile.push(result.isFile)
					ytURL.push(result.ytURL)
				}
				else {
					db.Song.create({
						title : title,
						artist : artist,
						img : data.img[i],
						album : data.album[i],
					})
					_id.push(await db.Song.findOne({title : title, artist : artist}))
					isFile.push(0)
				}
			}
			data._id = _id
			data.isFile = isFile
			data.ytURL = ytURL

			const date = new Date()
			const today = date.toLocaleDateString()

			res.render('main', {flag, data, today, vol})
		})
	}
	else if (flag === 'search') {
		const query = req.query.srchKwd
		const songs = await db.Song.find({$or : [{title : {$regex : query, $options : 'i'}}, {artist : {$regex : query, $options : 'i'}}]})
		console.log(songs)
		res.render('main', {flag, songs, srchKwd : query, vol})
	}
});

module.exports = router;
