const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log('Response status:', res.statusCode);
  res.on('data', (chunk) => process.stdout.write(chunk));
  res.on('end', () => console.log('\nResponse ended'));
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

// Send a partial body then abort
req.write(JSON.stringify({ username: 'abort_test' }).slice(0, 10));
setTimeout(() => {
  console.log('Client aborting request now');
  req.abort();
}, 150);

// Ensure process exits after a short timeout
setTimeout(() => process.exit(0), 2000);
