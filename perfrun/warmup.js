const https = require('https')
const log = require('./log')

function warmup(url) {
  return new Promise((resolve, reject) => {
    const MAX_RETRIES = 5
    let retries = 0

    function checkStatus(localUrl) {
      retries += 1
      if (retries > MAX_RETRIES) {
        reject(new Error(`[perf-runner] maximum retries exhausted for ${localUrl}`))
        return
      }

      https.get(localUrl, res => {
        if (res.statusCode === 301) {
          const redirect = res.headers.location
          log(`redirecting to ${redirect}`)
          retries = 0
          checkStatus(redirect)
        } else if (res.statusCode !== 200) {
          log(`could not reach ${url}, got ${res.statusCode}`)
          checkStatus(localUrl)
        } else {
          resolve(localUrl)
        }
      })
    }

    checkStatus(url)
  })
}

module.exports = warmup
