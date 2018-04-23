const bodyParser = require('body-parser')
const perfrun = require('../perfrun')

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
        perfrun({
          url: req.body.deployment.payload.web_url,
          version: req.body.deployment.sha
        })

        return res.sendStatus(200).end()
      }

      return res.sendStatus(404).end()
    }
  )
}
