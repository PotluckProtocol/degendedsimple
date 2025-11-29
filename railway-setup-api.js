#!/usr/bin/env node
/**
 * Railway Setup via API
 * Sets all environment variables for the Telegram bot
 */

const https = require('https');

const PROJECT_ID = '74204bee-cba6-4efd-9f08-4542fecfcfb9';
const RAILWAY_API_TOKEN = process.env.RAILWAY_API_TOKEN || process.env.RAILWAY_TOKEN;

const ENV_VARS = {
  TELEGRAM_BOT_TOKEN: '8585450134:AAETwTPdZxLBSmiBktQRcPl2tTzMrMA9Phs',
  TELEGRAM_CHAT_ID: '372188992',
  NEXT_PUBLIC_CONTRACT_ADDRESS: '0xC04c1DE26F5b01151eC72183b5615635E609cC81',
  NEXT_PUBLIC_SITE_URL: 'https://degended.bet',
  ALCHEMY_RPC_URL: 'https://sonic-mainnet.g.alchemy.com/v2/4l0fKzPwYbzWSqdDmxuSv',
  NEXT_PUBLIC_THIRDWEB_CLIENT_ID: 'f6847852033592db7f414e9b8eb170ba'
};

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.railway.app',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${RAILWAY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API Error: ${res.statusCode} - ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          reject(new Error(`Parse Error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function setupRailway() {
  console.log('🚂 Setting up Railway project...\n');

  if (!RAILWAY_API_TOKEN) {
    console.error('❌ RAILWAY_API_TOKEN or RAILWAY_TOKEN not set');
    console.log('\nPlease set your Railway API token:');
    console.log('export RAILWAY_API_TOKEN=your_token_here');
    console.log('\nOr use the CLI method instead.');
    process.exit(1);
  }

  try {
    console.log('📝 Setting environment variables...\n');
    
    // Note: Railway API endpoints may vary. This is a template.
    // The actual API might require different endpoints or authentication.
    console.log('⚠️  Railway API setup requires project-specific endpoints.');
    console.log('Please use the CLI method: ./setup-railway.sh');
    console.log('\nOr set variables manually in Railway dashboard.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  setupRailway();
}

module.exports = { setupRailway };
