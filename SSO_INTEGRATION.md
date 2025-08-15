# SSO Integration Documentation

This document describes the SSO (Single Sign-On) implementation for the Chat Bot Frontend application.

## Overview

The application now supports SSO authentication using JWT tokens. When a token is received from the parent SSO system, it's decoded to extract user information and authority from the `aiva-peruri.roles` field.

## Implementation Details

### 1. SSO Service (`src/services/ssoService.ts`)

A singleton service that handles:
- JWT token decoding
- User authority extraction from `aiva-peruri.roles[0]`
- User profile creation
- Authentication state management
- Token expiry validation
- Axios configuration for API requests

### 2. Router Integration (`src/router/index.ts`)

The router now includes:
- SSO token message listener
- Automatic token processing on page load
- Token validation and expiry checks
- Automatic redirection based on auth status

### 3. Enhanced useAuth Composable (`src/composables/useAuth.ts`)

Updated to support:
- SSO service integration
- Backward compatibility with legacy auth
- Additional helper methods for user information
- Authority-based access control

### 4. Example Component (`src/components/SSOUserProfile.vue`)

Demonstrates how to:
- Display user profile information
- Show user roles and authorities
- Implement authority-based UI elements
- Handle logout functionality

## Token Structure

The SSO implementation expects JWT tokens with the following structure:

```json
{
  "resource_access": {
    "aiva-peruri": {
      "roles": ["hukum", "admin", "user"]
    }
  },
  "name": "User Full Name",
  "email": "user@example.com",
  "preferred_username": "username",
  "given_name": "First",
  "family_name": "Last Name"
}
```

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# SSO origin for message validation
VITE_APP_ORIGIN=https://your-sso-provider.com

# API base URL
VITE_API_BASE_URL=http://localhost:8000
```

### Message Flow

1. Parent SSO system sends a `"ping"` message
2. Application responds with `"ready"`
3. Parent sends token via `postMessage`
4. Application decodes token and extracts authority
5. User is authenticated with first role from `aiva-peruri.roles`
6. Application responds with `"token_received"`

## Usage Examples

### Basic Authentication Check

```typescript
import { useAuth } from '@/composables/useAuth';

const { isAuthenticated, userAuthority } = useAuth();

if (isAuthenticated.value) {
  console.log('User authority:', userAuthority.value);
}
```

### Authority-based Access Control

```typescript
const { hasAuthority, hasAnyAuthority } = useAuth();

// Check specific authority
if (hasAuthority('hukum')) {
  // Show legal-related features
}

// Check multiple authorities
if (hasAnyAuthority(['admin departemen', 'super admin'])) {
  // Show admin features
}
```

### Getting User Information

```typescript
const { getUserDisplayName, getUserEmail, getUserRoles } = useAuth();

const displayName = getUserDisplayName(); // "John Doe"
const email = getUserEmail(); // "john.doe@example.com"
const roles = getUserRoles(); // ["hukum", "admin"]
```

### Manual SSO Service Usage

```typescript
import ssoService from '@/services/ssoService';

// Decode a token
const payload = ssoService.decodeToken(token);

// Extract authority
const authority = ssoService.extractUserAuthority(payload);

// Check if user has specific authority
const hasLegalAccess = ssoService.hasAuthority('hukum');
```

## Security Considerations

1. **Origin Validation**: Messages are only accepted from configured origins
2. **Token Expiry**: Tokens are automatically validated for expiry
3. **Automatic Cleanup**: Expired tokens trigger automatic logout
4. **Secure Storage**: Tokens are stored in localStorage (consider httpOnly cookies for production)

## Testing

To test the SSO integration:

1. Set up a parent window that sends the ping/token messages
2. Use the provided example token structure
3. Verify authority extraction and user profile creation
4. Test token expiry handling

## Migration from Legacy Auth

The implementation maintains backward compatibility:

- Existing localStorage-based auth still works
- Legacy login functions are preserved
- Gradual migration path available
- SSO data takes precedence over legacy data

## Error Handling

The implementation includes comprehensive error handling:

- Invalid token format
- Missing required fields
- Network failures
- Token expiry
- Origin validation failures

All errors are logged to console and trigger appropriate fallback behavior.
