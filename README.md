# perf-runner
**Run (frontend) performance tests on your GitHub's deployment**

For example, you could use this to record and analyze your Heroku's Review Apps performance.

All results are stored in your Firebase database and averages are calculated per deployment as well as globally.

## Requirements
- Somewhere to deploy this (heroku, aws, ...)
- A Firebase realtime database

## Setup
- Deploy to Heroku (or something else)
- Setup environment variables (see `.env_example`)

### GitHub
- Navigate to `https://github.com/<org>/<repo>/settings/hooks/new`
- Set the "Payload URL" to `https://<your-url>/webhooks/github`
- Set the "Content type" to `application/json`
- Set the "Secret" to the value you've saved as an environment variable
- Select "Let me select individual events." and choose the `Deployment statuses` event

## Metrics collected
- first-meaningful-paint
- first-interactive
- consistently-interactive
- speed-index-metric
- estimated-input-latency
- time-to-first-byte
- total-byte-weight
- bootup-time
- mainthread-work-breakdown
