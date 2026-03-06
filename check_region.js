const https = require('https');

const options = {
    hostname: 'ivoylfnuwnmwkpytmqxa.supabase.co',
    port: 443,
    path: '/rest/v1/',
    method: 'GET',
    headers: {
        'apikey': 'sb_publishable_EF_4CFeKGC2qkunFz87u8w__SSYnPVH'
    }
};

const req = https.request(options, (res) => {
    console.log('--- Response Headers ---');
    console.log(res.headers);

    if (res.headers['x-supabase-region']) {
        console.log('\n✅ REAL REGION FOUND:', res.headers['x-supabase-region']);
    } else {
        console.log('\n❌ Region header not found in direct response.');
    }
});

req.on('error', (e) => {
    console.error('Request failed:', e.message);
});

req.end();
