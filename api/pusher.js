const crypto = require('crypto');
const https = require('https');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { channel, event, data } = req.body;

    if (!channel || !event || !data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Pusher credentials
    const app_id = '2092441';
    const key = '2b106a71a8bd331695b6';
    const secret = process.env.PUSHER_SECRET || '';
    const cluster = 'us2';

    if (!secret) {
      return res.status(500).json({ error: 'Pusher secret not configured' });
    }

    // Prepare the body
    const body = JSON.stringify({
      name: event,
      channel: channel,
      data: JSON.stringify(data)
    });

    // Generate auth signature
    const timestamp = Math.floor(Date.now() / 1000);
    const body_md5 = crypto.createHash('md5').update(body).digest('hex');
    
    const auth_string = [
      'POST',
      `/apps/${app_id}/events`,
      `auth_key=${key}&auth_timestamp=${timestamp}&auth_version=1.0&body_md5=${body_md5}`
    ].join('\n');

    const auth_signature = crypto
      .createHmac('sha256', secret)
      .update(auth_string)
      .digest('hex');

    // Make request to Pusher
    const options = {
      hostname: `api-${cluster}.pusher.com`,
      port: 443,
      path: `/apps/${app_id}/events?auth_key=${key}&auth_timestamp=${timestamp}&auth_version=1.0&body_md5=${body_md5}&auth_signature=${auth_signature}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    return new Promise((resolve, reject) => {
      const pusherReq = https.request(options, (pusherRes) => {
        let responseData = '';

        pusherRes.on('data', (chunk) => {
          responseData += chunk;
        });

        pusherRes.on('end', () => {
          if (pusherRes.statusCode === 200) {
            res.status(200).json({ success: true });
            resolve();
          } else {
            console.error('Pusher error:', responseData);
            res.status(pusherRes.statusCode).json({ error: responseData });
            resolve();
          }
        });
      });

      pusherReq.on('error', (error) => {
        console.error('Request error:', error);
        res.status(500).json({ error: error.message });
        resolve();
      });

      pusherReq.write(body);
      pusherReq.end();
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
