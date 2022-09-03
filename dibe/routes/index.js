var express = require('express');
var router = express.Router();
const db = require('../models')
const fs = require('fs')
const request = require('request')
const MobileDetect = require('mobile-detect')

/* GET home page. */
router.get('/', (req, res) => {
	res.redirect('/index')
})

router.get('/:flag', async (req, res) => {
	const flag = req.params.flag
	if (flag === 'index') {
		const md = new MobileDetect(req.headers['user-agent'])
		if (md.mobile() && !req.isAuthenticated()) return res.redirect('/users/login')
		else if (md.mobile()) return res.render('mobile/index')
		res.render('main', { flag })
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

			res.render('main', {flag, data, today})
		})
	}
});

// router.get('/chart', async (req, res) => {
// 	const _id = []
// 	const isFile = []
// 	const ytURL = []
// 	const url = process.env.CHART_API_URL
// 	request(url, async (err, response, body) => {
// 		if (err) return res.json(err)
// 		const data = JSON.parse(body)
// 		for (let i=0; i<data.title.length; i++) {
// 			const title = data.title[i]
// 			const artist = data.artist[i]
// 			const result = await db.Song.findOne({title : title, artist : artist})
// 			if (result) {
// 				_id.push(result._id)
// 				isFile.push(result.isFile)
// 				ytURL.push(result.ytURL)
// 			}
// 			else {
// 				db.Song.create({
// 					title : title,
// 					artist : artist,
// 					img : data.img[i],
// 					album : data.album[i],
// 				})
// 				_id.push(await db.Song.findOne({title : title, artist : artist}))
// 				isFile.push(0)
// 			}
// 		}
// 		data._id = _id
// 		data.isFile = isFile
// 		data.ytURL = ytURL

// 		const date = new Date()
// 		const today = date.toLocaleDateString()

// 		res.render('chart', {data, today})
// 	})
// })

module.exports = router;
