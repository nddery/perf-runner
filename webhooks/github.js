const bodyParser = require('body-parser')
const perfrun = require('../perfrun')
const log = require('../log')

const checkRequestValidity = (req, res, next) => {
  const crypto = require('crypto')
  const calculatedHmac = crypto
    .createHmac('sha1', process.env.SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex')
  const githubHmac = req.header('X-Hub-Signature')

  if (`sha1=${calculatedHmac}` !== githubHmac) {
    return res.sendStatus(403).end()
  }

  return next()
}

module.exports = app => {
  app.post(
    '/webhooks/github',
    bodyParser.json(),
    checkRequestValidity,
    (req, res) => {
      const hook = req.header('X-GitHub-Event')

      if (
        hook === 'deployment_status' &&
        req.body.deployment_status.state === 'success'
      ) {
        const options = {
          url: req.body.deployment.payload.web_url,
          version: req.body.deployment.sha
        }

        log('Request received', options)
        perfrun(options)

        return res.sendStatus(200).end()
      }

      return res.sendStatus(404).end()
    }
  )
}
