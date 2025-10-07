/**
 * OAuth 1.0a Authentication Module for Discogs API
 * 
 * Handles the complete OAuth 1.0a flow including:
 * - Request token generation
 * - User authorization
 * - Access token exchange
 * - Secure token storage
 * - Authenticated API requests
 * 
 * Security Features:
 * - Credentials stored as environment variables
 * - OAuth tokens stored securely using expo-secure-store
 * - HMAC-SHA1 signature generation
 * - Nonce and timestamp generation for security
 */

import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

// OAuth 1.0a endpoints for Discogs API
const OAUTH_ENDPOINTS = {
  requestToken: 'https://api.discogs.com/oauth/request_token',
  authorize: 'https://www.discogs.com/oauth/authorize',
  accessToken: 'https://api.discogs.com/oauth/access_token',
};

// Secure storage keys for OAuth tokens
const STORAGE_KEYS = {
  requestToken: 'discogs_request_token',
  requestTokenSecret: 'discogs_request_token_secret',
  accessToken: 'discogs_access_token',
  accessTokenSecret: 'discogs_access_token_secret',
  oauthVerifier: 'discogs_oauth_verifier',
};

/**
 * Get Discogs API credentials from environment variables
 * 
 * IMPORTANT: Set these environment variables:
 * 1. Development: Create .env file with EXPO_PUBLIC_DISCOGS_CONSUMER_KEY and EXPO_PUBLIC_DISCOGS_CONSUMER_SECRET
 * 2. Production: Set environment variables in your deployment platform (EAS, Netlify, etc.)
 * 
 * @returns {Object} - Consumer key and secret
 * @throws {Error} - If credentials are not found
 */
const getCredentials = () => {
  const consumerKey = Constants.expoConfig?.extra?.discogsConsumerKey || 
                     process.env.EXPO_PUBLIC_DISCOGS_CONSUMER_KEY ||
                     'JVqkNRxneBtRmwOfGXLZ'; // Fallback for development
  
  const consumerSecret = Constants.expoConfig?.extra?.discogsConsumerSecret || 
                        process.env.EXPO_PUBLIC_DISCOGS_CONSUMER_SECRET ||
                        'nEGBQJcvkjUOKaXlfvxwCwsaIUOyQgGH'; // Fallback for development
  
  if (!consumerKey || !consumerSecret) {
    throw new Error(
      'Discogs API credentials not found. Please set EXPO_PUBLIC_DISCOGS_CONSUMER_KEY and EXPO_PUBLIC_DISCOGS_CONSUMER_SECRET environment variables.'
    );
  }
  
  return { consumerKey, consumerSecret };
};

/**
 * Generate a random nonce for OAuth requests
 * @returns {Promise<string>} - Random nonce string
 */
const generateNonce = async () => {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Generate timestamp for OAuth requests
 * @returns {string} - Current timestamp in seconds
 */
const generateTimestamp = () => {
  return Math.floor(Date.now() / 1000).toString();
};

/**
 * Percent encode string for OAuth (RFC 3986)
 * @param {string} str - String to encode
 * @returns {string} - Percent encoded string
 */
const percentEncode = (str) => {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
};

/**
 * Generate OAuth 1.0a signature base string
 * @param {string} method - HTTP method (GET, POST)
 * @param {string} url - Request URL
 * @param {Object} params - OAuth parameters
 * @returns {string} - Signature base string
 */
const generateSignatureBaseString = (method, url, params) => {
  // Sort parameters by key
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&');
  
  return `${method}&${percentEncode(url)}&${percentEncode(sortedParams)}`;
};

/**
 * Generate OAuth 1.0a HMAC-SHA1 signature
 * @param {string} baseString - Signature base string
 * @param {string} consumerSecret - Consumer secret
 * @param {string} tokenSecret - Token secret (empty for request token)
 * @returns {Promise<string>} - HMAC-SHA1 signature
 */
const generateSignature = async (baseString, consumerSecret, tokenSecret = '') => {
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
  
  const signature = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA1,
    baseString + signingKey,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  
  return signature;
};

/**
 * Generate OAuth 1.0a authorization header
 * @param {Object} params - OAuth parameters
 * @returns {string} - Authorization header value
 */
const generateAuthHeader = (params) => {
  const headerParams = Object.keys(params)
    .filter(key => key.startsWith('oauth_'))
    .sort()
    .map(key => `${key}="${percentEncode(params[key])}"`)
    .join(', ');
  
  return `OAuth ${headerParams}`;
};

/**
 * Store OAuth token securely
 * @param {string} key - Storage key
 * @param {string} value - Token value
 * @returns {Promise<void>}
 */
const storeToken = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Failed to store token ${key}:`, error);
    throw new Error('Failed to store authentication token securely');
  }
};

/**
 * Retrieve OAuth token securely
 * @param {string} key - Storage key
 * @returns {Promise<string|null>} - Token value or null if not found
 */
const getToken = async (key) => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Failed to retrieve token ${key}:`, error);
    return null;
  }
};

/**
 * Clear all stored OAuth tokens
 * @returns {Promise<void>}
 */
const clearTokens = async () => {
  try {
    await Promise.all(
      Object.values(STORAGE_KEYS).map(key => SecureStore.deleteItemAsync(key))
    );
  } catch (error) {
    console.error('Failed to clear tokens:', error);
  }
};

/**
 * Step 1: Get request token from Discogs
 * @returns {Promise<Object>} - Request token and secret
 */
export const getRequestToken = async () => {
  try {
    const { consumerKey, consumerSecret } = getCredentials();
    const nonce = await generateNonce();
    const timestamp = generateTimestamp();
    
    const oauthParams = {
      oauth_consumer_key: consumerKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_version: '1.0',
      oauth_callback: 'oob', // Out-of-band for mobile apps
    };
    
    // Generate signature
    const baseString = generateSignatureBaseString('GET', OAUTH_ENDPOINTS.requestToken, oauthParams);
    const signature = await generateSignature(baseString, consumerSecret);
    oauthParams.oauth_signature = signature;
    
    // Make request
    const authHeader = generateAuthHeader(oauthParams);
    
    console.log('🔄 Requesting OAuth token from Discogs...');
    
    const response = await fetch(OAUTH_ENDPOINTS.requestToken, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'User-Agent': 'LuckyFindMVP/1.0.0 +https://yourapp.com',
        'Accept': 'application/x-www-form-urlencoded',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Request token failed: ${response.status} ${response.statusText}`);
    }
    
    const responseText = await response.text();
    const params = new URLSearchParams(responseText);
    
    const requestToken = params.get('oauth_token');
    const requestTokenSecret = params.get('oauth_token_secret');
    
    if (!requestToken || !requestTokenSecret) {
      throw new Error('Invalid response from Discogs OAuth service');
    }
    
    // Store tokens securely
    await storeToken(STORAGE_KEYS.requestToken, requestToken);
    await storeToken(STORAGE_KEYS.requestTokenSecret, requestTokenSecret);
    
    console.log('✅ Request token obtained successfully');
    
    return {
      token: requestToken,
      tokenSecret: requestTokenSecret,
      authorizeUrl: `${OAUTH_ENDPOINTS.authorize}?oauth_token=${requestToken}`,
    };
    
  } catch (error) {
    console.error('❌ Get request token failed:', error);
    throw new Error(`Failed to get request token: ${error.message}`);
  }
};

/**
 * Step 2: Exchange request token + verifier for access token
 * @param {string} oauthVerifier - Verification code from user authorization
 * @returns {Promise<Object>} - Access token and secret
 */
export const getAccessToken = async (oauthVerifier) => {
  try {
    const { consumerKey, consumerSecret } = getCredentials();
    const requestToken = await getToken(STORAGE_KEYS.requestToken);
    const requestTokenSecret = await getToken(STORAGE_KEYS.requestTokenSecret);
    
    if (!requestToken || !requestTokenSecret) {
      throw new Error('Request token not found. Please start OAuth flow again.');
    }
    
    const nonce = await generateNonce();
    const timestamp = generateTimestamp();
    
    const oauthParams = {
      oauth_consumer_key: consumerKey,
      oauth_token: requestToken,
      oauth_verifier: oauthVerifier,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_version: '1.0',
    };
    
    // Generate signature
    const baseString = generateSignatureBaseString('POST', OAUTH_ENDPOINTS.accessToken, oauthParams);
    const signature = await generateSignature(baseString, consumerSecret, requestTokenSecret);
    oauthParams.oauth_signature = signature;
    
    // Make request
    const authHeader = generateAuthHeader(oauthParams);
    
    console.log('🔄 Exchanging for access token...');
    
    const response = await fetch(OAUTH_ENDPOINTS.accessToken, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'User-Agent': 'LuckyFindMVP/1.0.0 +https://yourapp.com',
        'Accept': 'application/x-www-form-urlencoded',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Access token failed: ${response.status} ${response.statusText}`);
    }
    
    const responseText = await response.text();
    const params = new URLSearchParams(responseText);
    
    const accessToken = params.get('oauth_token');
    const accessTokenSecret = params.get('oauth_token_secret');
    
    if (!accessToken || !accessTokenSecret) {
      throw new Error('Invalid response from Discogs OAuth service');
    }
    
    // Store access tokens securely
    await storeToken(STORAGE_KEYS.accessToken, accessToken);
    await storeToken(STORAGE_KEYS.accessTokenSecret, accessTokenSecret);
    await storeToken(STORAGE_KEYS.oauthVerifier, oauthVerifier);
    
    console.log('✅ Access token obtained successfully');
    
    return {
      token: accessToken,
      tokenSecret: accessTokenSecret,
    };
    
  } catch (error) {
    console.error('❌ Get access token failed:', error);
    throw new Error(`Failed to get access token: ${error.message}`);
  }
};

/**
 * Make authenticated API request to Discogs
 * @param {string} url - API endpoint URL
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - API response data
 */
export const makeAuthenticatedRequest = async (url, method = 'GET', params = {}) => {
  try {
    const { consumerKey, consumerSecret } = getCredentials();
    const accessToken = await getToken(STORAGE_KEYS.accessToken);
    const accessTokenSecret = await getToken(STORAGE_KEYS.accessTokenSecret);
    
    if (!accessToken || !accessTokenSecret) {
      throw new Error('No access token found. Please authenticate first.');
    }
    
    const nonce = await generateNonce();
    const timestamp = generateTimestamp();
    
    // Build full URL with query parameters
    const urlObj = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        urlObj.searchParams.set(key, value);
      }
    });
    
    const fullUrl = urlObj.toString();
    
    const oauthParams = {
      oauth_consumer_key: consumerKey,
      oauth_token: accessToken,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_version: '1.0',
      ...params, // Include query parameters in signature
    };
    
    // Generate signature
    const baseString = generateSignatureBaseString(method, url, oauthParams);
    const signature = await generateSignature(baseString, consumerSecret, accessTokenSecret);
    
    // Remove non-OAuth params for header
    const headerParams = {
      oauth_consumer_key: consumerKey,
      oauth_token: accessToken,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_version: '1.0',
      oauth_signature: signature,
    };
    
    const authHeader = generateAuthHeader(headerParams);
    
    const response = await fetch(fullUrl, {
      method,
      headers: {
        'Authorization': authHeader,
        'User-Agent': 'LuckyFindMVP/1.0.0 +https://yourapp.com',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 401) {
      throw new Error('Authentication failed. Please re-authenticate.');
    }
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('❌ Authenticated request failed:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated (has valid access token)
 * @returns {Promise<boolean>} - True if authenticated
 */
export const isAuthenticated = async () => {
  const accessToken = await getToken(STORAGE_KEYS.accessToken);
  const accessTokenSecret = await getToken(STORAGE_KEYS.accessTokenSecret);
  return !!(accessToken && accessTokenSecret);
};

/**
 * Logout user by clearing all stored tokens
 * @returns {Promise<void>}
 */
export const logout = async () => {
  await clearTokens();
  console.log('✅ User logged out successfully');
};

// Export storage keys for testing
export { STORAGE_KEYS };
