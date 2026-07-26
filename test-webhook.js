const crypto = require('crypto');

const secret = process.env.GITHUB_WEBHOOK_SECRET || 'dev_secret';
const payload = JSON.stringify({
  action: 'closed',
  pull_request: {
    number: 1,
    url: 'https://api.github.com/repos/shreyam/repo1/pulls/1',
    html_url: 'https://github.com/shreyam/repo1/pull/1',
    merged: true,
    title: 'Update architecture with awesome new pattern',
    body: 'We are now using Redux for global state.',
    head: {
      sha: 'abcdef1234567890'
    },
    base: {
      repo: {
        id: 123456,
        full_name: 'shreyam/repo1'
      }
    }
  },
  repository: {
    id: 123456,
    full_name: 'shreyam/repo1'
  }
});

const hmac = crypto.createHmac('sha256', secret);
hmac.update(payload);
const signature = `sha256=${hmac.digest('hex')}`;

fetch('http://localhost:3000/api/webhooks/github', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-hub-signature-256': signature,
    'x-github-event': 'pull_request',
    'x-github-delivery': crypto.randomUUID()
  },
  body: payload
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
