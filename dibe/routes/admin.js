const express = require('express')
const router = express.Router()
const db = require('../models')
const moment = require('moment')

router.get('/index', (req, res) => {
    res.render('admin/index')
})

router.get('/users', async (req, res) => {
    const users = await db.User.find().sort('-_id')
    res.render('admin/user', {users, moment})
})

router.get('/songs', async (req, res) => {
    res.render('admin/song')
})

module.exports = router