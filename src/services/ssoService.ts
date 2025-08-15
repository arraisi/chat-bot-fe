import axios from 'axios';

export interface UserProfile {
  name: string;
  email: string;
  username: string;
  roles: string[];
  givenName?: string;
  familyName?: string;
}

export interface TokenPayload {
  exp: number;
  iat: number;
  jti: string;
  iss: string;
  aud: string[];
  sub: string;
  typ: string;
  azp: string;
  session_state: string;
  acr: string;
  'allowed-origins': string[];
  realm_access: {
    roles: string[];
  };
  resource_access: {
    [key: string]: {
      roles: string[];
    };
  };
  scope: string;
  sid: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name?: string;
  family_name?: string;
  email: string;
}

class SSOService {
  private static instance: SSOService;

  private constructor() {}

  public static getInstance(): SSOService {
    if (!SSOService.instance) {
      SSOService.instance = new SSOService();
    }
    return SSOService.instance;
  }

  /**
   * Decode JWT token and extract payload
   */
  public decodeToken(token: string): TokenPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Extract user authority from aiva-peruri roles
   */
  public extractUserAuthority(tokenPayload: TokenPayload): string | null {
    const aivaRoles = tokenPayload.resource_access?.['aiva-peruri']?.roles;
    return aivaRoles && aivaRoles.length > 0 ? aivaRoles[0] : null;
  }

  /**
   * Create user profile from token payload
   */
  public createUserProfile(tokenPayload: TokenPayload): UserProfile {
    const aivaRoles = tokenPayload.resource_access?.['aiva-peruri']?.roles || [];
    
    return {
      name: tokenPayload.name,
      email: tokenPayload.email,
      username: tokenPayload.preferred_username,
      roles: aivaRoles,
      givenName: tokenPayload.given_name,
      familyName: tokenPayload.family_name,
    };
  }

  /**
   * Store authentication data in localStorage
   */
  public storeAuthData(token: string, authority: string, profile: UserProfile): void {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userAuthority', authority);
    localStorage.setItem('ssoToken', token);
    localStorage.setItem('userProfile', JSON.stringify(profile));

    // Configure axios with token
    this.configureAxiosToken(token);
  }

  /**
   * Configure axios with authentication token
   */
  public configureAxiosToken(token: string): void {
    axios.defaults.headers.common = axios.defaults.headers.common || {};
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Get stored authentication data
   */
  public getAuthData() {
    return {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
      authority: localStorage.getItem('userAuthority'),
      token: localStorage.getItem('ssoToken'),
      profile: this.getUserProfile(),
    };
  }

  /**
   * Get user profile from localStorage
   */
  public getUserProfile(): UserProfile | null {
    try {
      const profileStr = localStorage.getItem('userProfile');
      return profileStr ? JSON.parse(profileStr) : null;
    } catch (error) {
      console.error('Error parsing user profile:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  public isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }

  /**
   * Clear all authentication data
   */
  public clearAuthData(): void {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userAuthority');
    localStorage.removeItem('ssoToken');
    localStorage.removeItem('userProfile');

    // Remove authorization header
    if (axios.defaults.headers.common) {
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Check if user has specific authority/role
   */
  public hasAuthority(requiredAuthority: string): boolean {
    const { authority } = this.getAuthData();
    return authority === requiredAuthority;
  }

  /**
   * Check if user has any of the specified authorities/roles
   */
  public hasAnyAuthority(authorities: string[]): boolean {
    const profile = this.getUserProfile();
    if (!profile) return false;

    return authorities.some(auth => profile.roles.includes(auth));
  }
}

export default SSOService.getInstance();
