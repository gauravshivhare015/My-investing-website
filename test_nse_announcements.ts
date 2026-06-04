import https from 'https';

async function test() {
  const options = {
    hostname: 'www.nseindia.com',
    path: `/api/corporate-announcements?index=equities&from_date=04-05-2026&to_date=04-06-2026`,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Status:', res.statusCode, 'Data length:', data.length));
  });
  req.on('error', e => console.error(e));
  req.end();
}
test();
