const fs = require('fs');
require('dotenv').config();
const output = `
URL: ${process.env.SUPABASE_URL}
KEY: ${process.env.SUPABASE_KEY ? 'YES' : 'NO'}
CWD: ${process.cwd()}
`;
try {
    fs.writeFileSync('env_test_result.txt', output);
    console.log('File written');
} catch (e) {
    console.error(e);
}
