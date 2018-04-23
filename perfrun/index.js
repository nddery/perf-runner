const warmup = require('./warmup')
const analyze = require('./analyze')
const lighthouse = require('./lighthouse')
const { db, url2Key } = require('./database')
const queue = require('./queue')
const log = require('./log')

async function perfrun(options) {
  log('warming up', options)
  try {
    options.url = await warmup(options.url)
  } catch (error) {
    console.log(error.message)
    return
  }

  log('running tests', options)
  db.ref(`/refs/${url2Key(options.url)}`).push(options.version)
  const limiter = queue.key(`test-${options.version}`)
  const numberOfTestsToRun = process.env.NUMBER_OF_TESTS_TO_RUN || 5

  for (let i = 0; i < numberOfTestsToRun; i++) {
    limiter.schedule({ id: `test-${options.version}-${i}` }, lighthouse, {
      ...options,
      run: i
    }).catch(error => {
      console.log(`[bottleneck] ${error.message}`)
    })
  }

  limiter.on('idle', analyze.bind(null, options))

  limiter.on('error', error => {
    console.log(`[bottleneck] ${error.message}`)
  })

  if (process.env.DEBUG) {
    limiter.on('debug', function (message, data) {
      console.log(`[bottleneck] ${message}`)
    })
  }
}

module.exports = perfrun
