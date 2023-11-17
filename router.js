const express = require('express'),
    router = express.Router(),
    { verifyToken } = require('./verifyJwtToken'),
    { login, register, profile, forgotPassword, resetPassword } = require('./authController')

router.post('/login', login)
router.post('/register', register)
router.post('/forgot-password', forgotPassword),
router.post('/reset-password', resetPassword)
router.post('/profile', verifyToken, profile)


module.exports = router