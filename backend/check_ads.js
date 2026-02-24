const supabase = require('./supabase');

async function checkAds() {
    try {
        const { data, error } = await supabase.from('ads').select('*');
        if (error) {
            console.error('Error fetching ads:', error);
            return;
        }
        console.log('Ads found:', data.length);
        if (data.length > 0) {
            console.log('First ad:', data[0]);
        }
    } catch (err) {
        console.error('Catch error:', err);
    }
}

checkAds();
