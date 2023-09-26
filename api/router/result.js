const express = require('express')
const router = express.Router()

const result = require('../middleware/result.js')

router.post('/', result.regist)

module.exports = router