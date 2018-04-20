const { URL } = require('url')
const puppeteer = require('puppeteer')
const Lighthouse = require('lighthouse')
const config = require('lighthouse/lighthouse-core/config/perf.json')
const { db, url2Key } = require('./database')
const log = require('../log')

/* audit id: keep extended info */
const audits = {
  'first-meaningful-paint': true,
  'first-interactive': false,
  'consistently-interactive': false,
  'speed-index-metric': true,
  'estimated-input-latency': false,
  'time-to-first-byte': false,
  'total-byte-weight': false,
  'bootup-time': false,
  'mainthread-work-breakdown': true
}
const auditsIds = Object.keys(audits)

function massageLighthouseResult(lhr) {
  const perfReport = lhr.reportCategories.find(r => r.name === 'Performance')
  const perfAudits = perfReport.audits.filter(a => auditsIds.includes(a.id))

  return {
    lighthouseVersion: lhr.lighthouseVersion,
    generatedTime: lhr.generatedTime,
    url: lhr.url,
    runtimeConfig: lhr.runtimeConfig,
    score: lhr.score,
    audits: perfAudits.reduce((carry, audit) => {
      const { extendedInfo, helpText, details, ...rest } = audit.result

      if (audits[audit.id]) {
        rest.extendedInfo = audit.result.extendedInfo
      }

      // Ensure no undefined values, as this would break Firebase
      carry[audit.id] = JSON.parse(JSON.stringify(rest))

      return carry
    }, Object.create(null))
  }
}

async function lighthouse(options) {
  const { url, version } = options
  log('launching puppeteer', options)
  const browser = await puppeteer.launch()

  log('running lighthouse', options)
  const lhr = await Lighthouse(
    url,
    {
      port: new URL(browser.wsEndpoint()).port,
      output: 'json'
    },
    config
  )

  log('pushing results', options)
  db
    .ref(`/raw_results/${url2Key(url)}/${version}`)
    .push(massageLighthouseResult(lhr))

  await browser.close()
}

module.exports = lighthouse
