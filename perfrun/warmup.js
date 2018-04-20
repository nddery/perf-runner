const https = require('https')

function warmup(url) {
  return new Promise((resolve, reject) => {
    const MAX_RETRIES = 5
    let retries = 0

    function checkStatus() {
      retries += 1
      if (retries > MAX_RETRIES) {
        reject(new Error(`Maximum retries exhausted for ${url}`))
        return
      }

      https.get(url, res => {
        if (res.statusCode !== 200) {
          console.log(`Could not reach ${url}, got ${res.statusCode}`)
          checkStatus()
        } else {
          resolve()
        }
      })
    }

    checkStatus()
  })
}

module.exports = warmup
