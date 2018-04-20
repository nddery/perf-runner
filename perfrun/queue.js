const Bottleneck = require('bottleneck')

const queue = new Bottleneck.Group({
  maxConcurrent: process.env.MAX_CONCURRENCY || 1
})

module.exports = queue
