const express = require('express')
const router = express.Router()
const db = require('../models')

router.get('/index/:pass', (req, res) => {
    const pass = req.params.pass
    if (pass === 'dibe') res.render('admin/index')
})

module.exports = router