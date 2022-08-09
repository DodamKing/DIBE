const express = require('express')
const router = express.Router()
const db = require('../models')

router.get('/index', (req, res) => {
    res.render('admin/index')
})

module.exports = router