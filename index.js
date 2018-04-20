require('dotenv').config()

const express = require('express')
const port = process.env.PORT || 6440
const app = express()

require('./webhooks/github')(app)

app.listen(port, () => {
  console.log(`Server started, listening on port ${port}`)
})
