const supabase = require('./supabase');

async function checkAds() {
    try {
        const { data, error } = await supabase.from('ads').select('name, status, owner_id');
        if (error) {
            console.error('Error fetching ads:', error);
            return;
        }
        console.log('Ads in DB:');
        data.forEach(ad => {
            console.log(`- Name: ${ad.name}, Status: '${ad.status}', Owner: ${ad.owner_id}`);
        });
    } catch (err) {
        console.error('Catch error:', err);
    }
}

checkAds();
