// Patches
const { inject, errorHandler } = require('express-custom-error')
inject() // Patch express in order to use async / await syntax
// Require Dependencies
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const helmet = require('helmet')
const logger = require('./util/logger')

// Instantiate an Express Application
const app = express()

// Configure Express App Instance
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Configure custom logger middleware
app.use(logger.dev, logger.combined)
app.use(cookieParser())
app.use(cors())
app.use(helmet())

// Configuration CORS pour la production
const corsOptions = {
  origin: [
    'http://localhost:5173', // Développement
    'https://morchidy.github.io' // Production GitHub Pages
  ],
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

// Frontend code access in static mode
app.use('/frontend', express.static('./src/frontend'))

// Swagger Documentation
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('../swagger_output.json')
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

// This middleware adds the json header to every response
app.use('*', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json')
  next()
})

// Assign Routes
app.use('/', require('./routes/router.js'))
// Handle errors
app.use(errorHandler())
// Handle not valid route
app.use('*', (req, res) => {
  res
    .status(404)
    .json({ status: false, message: 'Endpoint Not Found' })
})
module.exports = app
