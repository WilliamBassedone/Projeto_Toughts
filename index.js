const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const flash = require('express-flash')

// Iniciando express
const app = express()

// Conectando ao banco de dados
const conn = require('./db/conn')

// Import Routes
const toughtsRoutes = require('./routes/ToughtsRoutes')
const AuthRoutes = require('./routes/AuthRoutes')

// Models
const User = require('./models/User')
const Tought = require('./models/Tought')

// Import controller
const ToughtController = require('./controllers/ToughtController')

// Template engine
app.engine('handlebars', exphbs())
app.set('view engine', 'handlebars')

// receber resposta do body - formulários
app.use(
      express.urlencoded({
            extended: true
      })
)
app.use(express.json())

// session middleware
app.use(
      session({
            name: "session",
            secret: "nosso_secret",
            resave: false,
            saveUninitialized: false,
            store: new FileStore({
                  logFn: function () { },
                  path: require('path').join(require('os').tmpdir(), 'sessions'),
            }),
            cookie: {
                  secure: false,
                  maxAge: 360000,
                  expires: new Date(Date.now() + 360000),
                  httpOnly: true
            }
      }),
)

// flash messages
app.use(flash())

// public path
app.use(express.static('public'))

// set session to res
app.use((req, res, next) => {
      if (req.session.userid) {
            res.locals.session = req.session
      }
      next()
})

// Routes
app.use('/toughts', toughtsRoutes)
app.use('/', AuthRoutes)

app.get('/', ToughtController.showToughts)

// Sequelize funciona utilizando promisses
conn
      // .sync({force: true})
      .sync()
      .then(() => {
            app.listen(3000)
      })
      .catch((err) => console.log(err))