const express = require('express')
const router = express.Router()

router.get('/upload', (req, res) => {
    res.json('업로드 만들꺼임')
})

module.exports = router