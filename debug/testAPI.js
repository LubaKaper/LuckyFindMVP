/**
 * Test Discogs API Connection
 * 
 * This script tests if the Discogs API credentials are working properly
 */

import Constants from 'expo-constants';

const testDiscogsAPI = async () => {
  console.log('🧪 Testing Discogs API Connection...');
  
  // Get credentials
  const personalToken = Constants.expoConfig?.extra?.DISCOGS_PERSONAL_TOKEN || 
                       process.env.EXPO_PUBLIC_DISCOGS_PERSONAL_TOKEN;
  const consumerKey = Constants.expoConfig?.extra?.DISCOGS_CONSUMER_KEY || 
                     process.env.EXPO_PUBLIC_DISCOGS_CONSUMER_KEY;
  const consumerSecret = Constants.expoConfig?.extra?.DISCOGS_CONSUMER_SECRET || 
                        process.env.EXPO_PUBLIC_DISCOGS_CONSUMER_SECRET;

  console.log('🔑 Credentials Check:');
  console.log('- Personal Token:', personalToken ? `${personalToken.substring(0, 8)}...` : 'NOT FOUND');
  console.log('- Consumer Key:', consumerKey ? `${consumerKey.substring(0, 8)}...` : 'NOT FOUND');
  console.log('- Consumer Secret:', consumerSecret ? `${consumerSecret.substring(0, 8)}...` : 'NOT FOUND');

  // Test API call
  const testUrl = 'https://api.discogs.com/database/search?q=beatles&type=release&per_page=1';
  
  const headers = {
    'User-Agent': 'LuckyFindMVP/1.0 +https://github.com/luba/LuckyFindMVP',
  };
  
  if (personalToken) {
    headers['Authorization'] = `Discogs token=${personalToken}`;
  }
  
  try {
    console.log('📡 Making test API call...');
    const response = await fetch(testUrl, { headers });
    
    console.log('📋 API Response:');
    console.log('- Status:', response.status);
    console.log('- Status Text:', response.statusText);
    console.log('- Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Test SUCCESS!');
      console.log('- Results found:', data.results?.length || 0);
      console.log('- Total items:', data.pagination?.items || 0);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log('❌ API Test FAILED!');
      console.log('- Error:', errorText);
      return { success: false, error: errorText };
    }
    
  } catch (error) {
    console.log('❌ Network Error:', error.message);
    return { success: false, error: error.message };
  }
};

export { testDiscogsAPI };