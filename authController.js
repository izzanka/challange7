const {PrismaClient} = require('@prisma/client'),
    prisma = new PrismaClient(),
    utils = require('./utils'),
    jwt = require('jsonwebtoken'),
    nodemailer = require('nodemailer'),
    bcrypt = require('bcrypt')

module.exports = {

    register: async(req, res) => {

        try {

            const {email, name, password} = req.body

            if(!email || !name || !password){
                return res.render('error', {
                    error: true,
                    message: 'all fields is required'
                })
            } 

            const check = await prisma.users.findFirst({
                where:{
                    email: email
                }
            })

            if(check){
                return res.render('error', {
                    error: true,
                    message: 'email already exists.'
                })
            }
         
            const bcryptPassword = await utils.crypt(password)

            const user = await prisma.users.create({
                data: {
                    name: name,
                    email: email,
                    password: bcryptPassword
                }
            })

            return res.render('profile', {
                error: false,
                message: 'register success'
            })
            
        } catch (error) {

            console.log(error.message)
            return res.render('error', {
                error: true,
                message: 'server error.'
            })
            
        }
    },

    login: async(req,res) => {

        try {

            const {email, password} = req.body

            if(!email || !password){
                return res.render('error', {
                    error: true,
                    message: 'all fields is required'
                })
            }

            const user = await prisma.users.findFirst({
                where:{
                    email: email
                }
            })
            
            if(!user){
                return res.render('error', {
                    error: true,
                    message: `user with email ${email} not found.`
                })
            }

            const result = await bcrypt.compare(password, user.password)

            if(!result){
                return res.render('error', {
                    error: true,
                    message: 'password is wrong.'
                })
            }

            const jwt_token = jwt.sign({id: user.id}, process.env.SECRET_KEY, {expiresIn: '6h'})
            
            return res.render('profile', {
                error: false,
                message: 'login success'
            })
            
        } catch (error) {

            console.log(error.message)
            return res.render('error', {
                error: true,
                message: 'server error.'
            })
        
        }
    },

    profile: async(req, res) => {

        try {

            const userID = parseInt(res.user.id)

            const user = await prisma.users.findUnique({
                where: {
                    id: userID
                }
            })

            if(!user){
                return res.render('error', {
                    error: true,
                    message: `user with id ${userID} not found.`
                })
            }

            return res.render('profile', {
                error: false,
                message: 'login success'
            })
            
        } catch (error) {
            console.log(error.message)
            return res.render('error', {
                error: true,
                message: 'server error.'
            })
        }
    },

    forgotPassword: async(req, res) => {
        try {

            const { email } = req.body

            if(!email){
                return res.render('error', {
                    error: true,
                    message: "all fields is required."
                })
            }

            const user = await prisma.users.findFirst({
                where: {
                    email: email
                }
            })

            if(!user){
                return res.render('error', {
                    error: true,
                    message: `user with email ${email} not found.`
                })
            }

            if(user.resetPasswordToken != null){
                return res.render('error', {
                    error: true,
                    message: `reset password link already sent to email ${user.email}`
                })
            }

            const bcryptToken = await utils.crypt(email)

            bcryptToken.replace(/\//g, "")

            await prisma.users.update({
                data: {
                    resetPasswordToken: bcryptToken
                },
                where:{
                    id: user.id
                }
            })

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.NODEMAILER_USER,
                    pass: process.env.NODEMAILER_PASS
                }
            })

            const mailOptions = {
                from: process.env.NODEMAILER_USER,
                to: email,
                subject: "Reset Password",
                html: `<p>Click <a href="http://localhost:${process.env.PORT}/reset-password/${bcryptToken}">here</a> to reset your password.</p>`
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if(error){
                    console.log(error)
                    return res.render('error', {
                        error: true,
                        message: error
                    })
                }

                return res.render('success', {
                    error: false,
                    message: "check your email for reset password link.",
                })
            })

        } catch (error) {
            console.log(error.message)
            return res.render('error', {
                error: true,
                message: 'server error.'
            })
        }
    },

    resetPassword: async(req, res) => {
        try {

            const { token, password } = req.body

            const user = await prisma.users.findFirst({
                where: {
                    resetPasswordToken: token
                }
            })

            if(!user){
                return res.render('error', {
                    error: true,
                    message: 'invalid reset password token.'
                })
            }

            const bcryptPassword = await utils.crypt(password)

            await prisma.users.update({
                data: {
                    password: bcryptPassword,
                    resetPasswordToken: null
                },
                where:{
                    id: user.id
                }
            })

            return res.render('success', {
                error: false,
                message: "reset password success",
            })

        } catch (error) {
            console.log(error.message)
            return res.render('error', {
                error: true,
                message: 'server error.'
            })
        }
    }
}