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
	const vol = req.cookies.vol
	if (flag === 'today') {
		const md = new MobileDetect(req.headers['user-agent'])
		if (md.mobile() && !req.isAuthenticated()) return res.redirect('/users/login')
		else if (md.mobile()) return res.render('mobile/index')
		res.render('main', { flag, vol })
	}
	else if (flag === 'chart') {
		const date = new Date()
		const today = date.toLocaleDateString()
		const data = await db.Chart.find()

		res.render('main', {flag, data, today, vol})
	}
	else if (flag === 'search') {
		const query = req.query.srchKwd
		const songs = await db.Song.find({$or : [{title : {$regex : query, $options : 'i'}}, {artist : {$regex : query, $options : 'i'}}]})
		res.render('main', {flag, songs, srchKwd : query, vol})
	}
});

router.get('/test/my', async (req, res) => {
	// const result = await myModule.setRyrics()
	const result = await myModule.setWrongYtURL()
	res.json(result)
})

module.exports = router;
