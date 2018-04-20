function log(message, { url, version, run }) {
  let msg = `${message} for ${url} @ ${version}`

  if (run) {
    msg += ` (${(run += 1)})`
  }

  console.log(msg)
}

module.exports = log
