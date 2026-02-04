const fs = require('fs');
const log = (msg) => fs.appendFileSync('diag_log.txt', msg + '\n');

log('Starting diagnosis...');
try {
    const dotenv = require('dotenv');
    const result = dotenv.config();
    if (result.error) {
        log('Dotenv error: ' + result.error);
    } else {
        log('Dotenv loaded.');
        log('Parsed env keys: ' + Object.keys(result.parsed || {}).join(', '));
    }

    log('Current directory: ' + process.cwd());
    log('SUPABASE_URL: ' + process.env.SUPABASE_URL);
    log('SUPABASE_KEY: ' + (process.env.SUPABASE_KEY ? 'Found' : 'Missing'));

    log('Requiring supabase.js...');
    const supabase = require('./supabase');
    log('Supabase required successfully.');
} catch (err) {
    log('Error: ' + err.stack);
}
