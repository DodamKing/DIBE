var express = require('express');
var router = express.Router();
const db = require('../models')
const fs = require('fs')
const request = require('request')
const MobileDetect = require('mobile-detect');
const myModule = require('../public/javascripts/myModule');

/* GET home page. */
router.get('/', (req, res) => {
	const md = new MobileDetect(req.headers['user-agent'])
	if (md.mobile()) return res.render('mobile/temp')
	res.redirect('/today')
})

router.get('/:flag', async (req, res) => {
	const flag = req.params.flag
	
	if (flag === 'today') {
		const md = new MobileDetect(req.headers['user-agent'])
		if (md.mobile() && !req.isAuthenticated()) return res.redirect('/users/login')
		else if (md.mobile()) return res.render('mobile/index')
		res.render('main', { flag })
	}
	else if (flag === 'chart') {
		const date = new Date()
		const today = date.toLocaleDateString()
		const data = await db.Chart.find()

		res.render('main', {flag, data, today})
	}
	else if (flag === 'search') {
		const query = req.query.srchKwd
		const songs = await db.Song.find({$or : [{title : {$regex : query, $options : 'i'}}, {artist : {$regex : query, $options : 'i'}}]})
		res.render('main', {flag, songs, srchKwd : query})
	}
	else if (flag === 'playlist') {
		if (!req.isAuthenticated()) return res.redirect('/users/login')
		
		const playList = await db.PlayList.find()
		const thums = []

		for (const item of playList) {
			const thum = {}
			if (item.content) {
			const songIds = item.content.split('/').slice(0, -1)
			if (songIds.length >= 4) {
				thum.thum1 = (await db.Song.findById(songIds[0])).img.replace('50', '100')
				thum.thum2 = (await db.Song.findById(songIds[1])).img.replace('50', '100')
				thum.thum3 = (await db.Song.findById(songIds[2])).img.replace('50', '100')
				thum.thum4 = (await db.Song.findById(songIds[3])).img.replace('50', '100')
			}
			else if (songIds.length == 3) {
				thum.thum1 = (await db.Song.findById(songIds[0])).img.replace('50', '100')
				thum.thum2 = (await db.Song.findById(songIds[1])).img.replace('50', '100')
				thum.thum3 = (await db.Song.findById(songIds[2])).img.replace('50', '100')
				thums.thum4 = ''
			}
			else if (songIds.length == 2) {
				thum.thum1 = (await db.Song.findById(songIds[0])).img.replace('50', '100')
				thum.thum2 = (await db.Song.findById(songIds[1])).img.replace('50', '100')
				thums.thum3 = ''
				thums.thum4 = ''
			}
			else if (songIds.length == 1) {
				thum.thum1 = (await db.Song.findById(songIds[0])).img.replace('50', '200')
				thums.thum2 = ''
				thums.thum3 = ''
				thums.thum4 = ''
			}
			}
			thums.push(thum)
		}

		res.render('main', {flag, playList, thums})
	}
});

router.get('/playlist/:listId', (req, res) => {
	if (!req.isAuthenticated()) return res.redirect('/users/login')
	
	const listId = req.params.listId
	const flag = 'playlist/' + listId
	res.render('main', {flag, listId})
})

router.get('/test/my', async (req, res) => {
	// const result = await myModule.setRyrics()
	const result = await myModule.setWrongYtURL()
	// const result = await myModule.downSongsFile()
	res.json(result)
})

module.exports = router;
