const express = require("express"),
  bodyParser = require("body-parser"),
  app = express(),
  sentry = require('@sentry/node'),
  cors = require('cors'),
  router = require('./router'),
  { ProfilingIntegration } = require('@sentry/profiling-node'),
  { verifyToken } = require('./verifyJwtToken'),
  {PrismaClient} = require('@prisma/client'),
  prisma = new PrismaClient()

require('dotenv').config()

const PORT = process.env.PORT

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))

sentry.init({
    dsn: 'https://ff0cab0dd5963d92faeec85716979afc@o4506218491609088.ingest.sentry.io/4506219051745280',
    integrations: [
      // enable HTTP calls tracing
      new sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new sentry.Integrations.Express({ app }),
      new ProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
});

// The request handler must be the first middleware on the app
app.use(sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(sentry.Handlers.tracingHandler());

app.use('/api/v1', router)

app.get('/', (req, res) => {
  return res.render('index')
})

app.get('/login', (req,res) => {
  return res.render('login')
})

app.get('/register', (req, res) => {
  return res.render('register')
})

app.get('/forgot-password', (req, res) => {
  return res.render('forgot-password')
})

app.get('/reset-password/:token', async (req,res) => {

  try {

    console.log('test')

    const user = await prisma.users.findFirst({
      where: {
        resetPasswordToken: req.params.token
      }
    })

    if(!user){
      return res.render('error', {
        error: true,
        message: 'reset password token invalid.'
      })
    }

    return res.render('reset-password', {token: user.resetPasswordToken})
    
  } catch (error) {
    
  }
})

app.get('/profile', (req,res) => {
  return res.render('profile')
})

app.use(sentry.Handlers.errorHandler());

app.listen(PORT, () => {
  console.log(`server is listening at port ${PORT}`);
});