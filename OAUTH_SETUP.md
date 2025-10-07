# Discogs OAuth Integration Setup

## Overview
This document provides instructions for setting up Discogs OAuth 1.0a authentication in the LuckyFind MVP application.

## Prerequisites
1. Discogs Developer Account
2. Registered Discogs Application
3. Consumer Key and Consumer Secret from Discogs

## Environment Variables Setup

### Development Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Update .env file with your credentials:**
   ```env
   EXPO_PUBLIC_DISCOGS_CONSUMER_KEY=JVqkNRxneBtRmwOfGXLZ
   EXPO_PUBLIC_DISCOGS_CONSUMER_SECRET=nEGBQJcvkjUOKaXlfvxwCwsaIUOyQgGH
   ```

   **⚠️ SECURITY WARNING:** Never commit the `.env` file to version control!

### Production Setup

#### For EAS Build:
```bash
# Set environment variables
eas secret:create --scope project --name EXPO_PUBLIC_DISCOGS_CONSUMER_KEY --value your_consumer_key
eas secret:create --scope project --name EXPO_PUBLIC_DISCOGS_CONSUMER_SECRET --value your_consumer_secret
```

#### For Expo Classic Builds:
Add to `app.json`:
```json
{
  "expo": {
    "extra": {
      "discogsConsumerKey": "JVqkNRxneBtRmwOfGXLZ",
      "discogsConsumerSecret": "nEGBQJcvkjUOKaXlfvxwCwsaIUOyQgGH"
    }
  }
}
```

#### For Other Platforms:
- **Vercel/Netlify:** Set in dashboard environment variables
- **AWS/Heroku:** Configure in deployment environment
- **Docker:** Pass via environment variables or secrets

## OAuth Flow

### 1. Request Token
```javascript
import { getRequestToken } from '../api/oauth';

const tokenData = await getRequestToken();
// Returns: { token, tokenSecret, authorizeUrl }
```

### 2. User Authorization
1. Open `tokenData.authorizeUrl` in browser
2. User logs into Discogs
3. User authorizes the application
4. User receives verification code

### 3. Access Token Exchange
```javascript
import { getAccessToken } from '../api/oauth';

const accessData = await getAccessToken(verificationCode);
// Returns: { token, tokenSecret }
```

### 4. Authenticated API Requests
```javascript
import { makeAuthenticatedRequest } from '../api/oauth';

const results = await makeAuthenticatedRequest(
  'https://api.discogs.com/database/search',
  'GET',
  { q: 'Abbey Road', type: 'release' }
);
```

## Security Features

### Token Storage
- **expo-secure-store**: All OAuth tokens stored securely
- **Platform Security:**
  - iOS: Keychain Services
  - Android: Shared Preferences with AES encryption
  - Web: Not supported (tokens in memory only)

### Credential Protection
- **Environment Variables**: Never hardcode credentials
- **Git Ignore**: `.env` files excluded from version control
- **Production Secrets**: Use platform-specific secure storage

### API Security
- **HMAC-SHA1 Signatures**: All requests cryptographically signed
- **Nonce/Timestamp**: Prevents replay attacks
- **Rate Limiting**: Respects Discogs API limits
- **Error Handling**: Secure error messages

## Usage in Components

### Authentication Button
```javascript
import { AuthButton } from '../components';

<AuthButton onAuthChange={(isAuth) => setAuthenticated(isAuth)} />
```

### Search with Authentication
```javascript
import { searchRecords } from '../api/discogs';
import { isAuthenticated } from '../api/oauth';

const handleSearch = async () => {
  if (!(await isAuthenticated())) {
    alert('Please log in first');
    return;
  }
  
  const results = await searchRecords({
    query: 'Abbey Road',
    genre: 'rock',
    year: '1969'
  });
};
```

## Error Handling

### Common Errors
- **Authentication Required**: User needs to log in
- **Rate Limit Exceeded**: Too many API calls
- **Invalid Credentials**: Wrong consumer key/secret
- **Network Error**: Connection issues

### Error Recovery
```javascript
try {
  const results = await searchRecords(params);
} catch (error) {
  if (error.message.includes('Authentication')) {
    // Redirect to login
    await logout();
    setShowAuthModal(true);
  } else if (error.message.includes('Rate limit')) {
    // Show retry message
    setRetryAfter(60); // seconds
  }
}
```

## API Endpoints

### OAuth Endpoints
- **Request Token:** `https://api.discogs.com/oauth/request_token`
- **Authorization:** `https://www.discogs.com/oauth/authorize`
- **Access Token:** `https://api.discogs.com/oauth/access_token`

### API Endpoints
- **Search:** `https://api.discogs.com/database/search`
- **Release Details:** `https://api.discogs.com/releases/{id}`
- **Artist Info:** `https://api.discogs.com/artists/{id}`
- **Label Info:** `https://api.discogs.com/labels/{id}`

## Rate Limits
- **Authenticated Requests:** 60 requests per minute
- **Unauthenticated:** 25 requests per minute
- **Search API:** 1 request per second
- **Images:** No specific limit

## Testing

### Manual Testing
1. Start app: `npm start`
2. Click "Login to Discogs"
3. Complete OAuth flow
4. Test search functionality
5. Verify results display

### Automated Testing
```javascript
import { isAuthenticated, logout } from '../api/oauth';

describe('OAuth Integration', () => {
  it('should check authentication status', async () => {
    const isAuth = await isAuthenticated();
    expect(typeof isAuth).toBe('boolean');
  });
  
  it('should logout successfully', async () => {
    await logout();
    const isAuth = await isAuthenticated();
    expect(isAuth).toBe(false);
  });
});
```

## Troubleshooting

### Common Issues

1. **"Consumer key not found"**
   - Check environment variables are set
   - Verify `.env` file exists and is correct
   - Restart development server

2. **"Authorization failed"**
   - Check consumer secret is correct
   - Ensure callback URL is set to 'oob'
   - Verify system clock is accurate

3. **"Rate limit exceeded"**
   - Implement request throttling
   - Add retry logic with backoff
   - Monitor API usage

4. **"Invalid signature"**
   - Check consumer secret
   - Verify request parameters
   - Ensure proper URL encoding

### Debug Mode
Set debug logging in development:
```javascript
// In api/oauth.js
const DEBUG_MODE = __DEV__;

if (DEBUG_MODE) {
  console.log('OAuth Debug:', { params, signature, baseString });
}
```

## Security Checklist

- [ ] Environment variables configured
- [ ] `.env` file in `.gitignore`
- [ ] Production credentials secured
- [ ] OAuth tokens stored securely
- [ ] Rate limiting implemented
- [ ] Error handling covers all cases
- [ ] No credentials in source code
- [ ] API requests use HTTPS
- [ ] User consent flow clear

## Migration Notes

### From Mock to Real API
1. Replace `mockAdvancedSearch` with `advancedSearch`
2. Add authentication checks
3. Handle OAuth flow in UI
4. Update error handling
5. Test with real data

### Future Enhancements
- **Token Refresh**: Auto-refresh expired tokens
- **Offline Mode**: Cache results for offline use
- **Multiple Accounts**: Support multiple Discogs accounts
- **Advanced Auth**: Consider OAuth 2.0 migration when available