const supabase = require('./supabase');

async function checkAds() {
    try {
        const { data, error } = await supabase.from('ads').select('status');
        if (error) {
            console.error('Error fetching ads:', error);
            return;
        }
        const counts = data.reduce((acc, ad) => {
            acc[ad.status] = (acc[ad.status] || 0) + 1;
            return acc;
        }, {});
        console.log('Status counts:', counts);
    } catch (err) {
        console.error('Catch error:', err);
    }
}

checkAds();
