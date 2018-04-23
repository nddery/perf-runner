const { db, url2Key } = require('./database')
const log = require('./log')

function calculateAverages(snapshot) {
  const results = snapshot.val()
  const keys = Object.keys(results)

  return keys.reduce((carry, key) => {
    const result = results[key]
    const score =
      ((carry.score || 0) + result.score) /
      process.env.NUMBER_OF_TESTS_TO_RUN
    const audits = Object.keys(result.audits).reduce(
      (carry, audit) => ({
        ...carry,
        [audit]: (carry[audit] || 0) + result.audits[audit].rawValue
      }),
      Object.create(null)
    )

    return {
      score,
      ...audits
    }
  }, Object.create(null))
}

function calculateTotals(keys, results, averages) {
  return keys.reduce(
    (carry, key) => ({
      ...carry,
      [key]: (results.totals[key] || 0) + averages[key]
    }),
    Object.create(null)
  )
}

function calculateGlobalAverages(keys, totals, divider) {
  return keys.reduce(
    (carry, key) => ({
      ...carry,
      [key]: totals[key] / divider
    }),
    Object.create(null)
  )
}

function analyze(options) {
  const { url, version } = options
  log('processing results', options)
  db.ref(`/raw_results/${url2Key(url)}/${version}`).once(
    'value',
    snapshot => {
      const averages = calculateAverages(snapshot)

      log('pushing averages', options)
      db.ref(`/averages/${url2Key(url)}/${version}`).set(averages)

      db.ref('/averages/_global').once('value', snapshot => {
        const results = snapshot.val()
        const keys = Object.keys(results.totals)

        const totals = calculateTotals(keys, results, averages)
        const globalAverages = calculateGlobalAverages(keys, totals, results.divider)

        log('pushing global averages', options)
        db.ref('/averages/_global').set({
          divider: (results.divider += 1),
          averages: globalAverages,
          totals
        })
      })
    },
    error => log(error.message)
  )
}

module.exports = analyze
