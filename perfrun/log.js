function log(message, options = {}) {
  const { url, version, run } = options

  let msg = `[perf-runner] ${message}`

  if (url) {
    msg += ` -- ${url}`
  }

  if (version) {
    msg += ` @ ${version}`
  }

  if (typeof run === 'number') {
    msg += ` (${(run + 1)})`
  }

  console.log(msg)
}

module.exports =  log
