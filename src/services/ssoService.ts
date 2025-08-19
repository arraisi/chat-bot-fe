import axios from 'axios';
import type { Authority, UserAccount } from '../types/chat';

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
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
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
    if (!aivaRoles || aivaRoles.length === 0) {
      return null;
    }

    // Get the first role and convert to uppercase
    const originalRole = aivaRoles[0];
    const firstRole = originalRole.toUpperCase();

    console.log(`SSO: Converting role "${originalRole}" to authority "${firstRole}"`);

    // Map roles to valid authorities
    const validAuthorities = ['ALL', 'SDM', 'HUKUM', 'ADMIN'];

    // Check if the uppercase role is a valid authority
    if (validAuthorities.includes(firstRole)) {
      return firstRole;
    }

    // If the role doesn't match, log a warning and return null
    console.warn(
      `Invalid authority role: ${originalRole} (converted to ${firstRole}). Valid authorities are:`,
      validAuthorities
    );
    return null;
  }

  /**
   * Create user profile from token payload
   */
  public createUserProfile(tokenPayload: TokenPayload): UserProfile {
    const aivaRoles = tokenPayload.resource_access?.['aiva-peruri']?.roles || [];

    const profile = {
      name: tokenPayload.name,
      email: tokenPayload.email,
      username: tokenPayload.preferred_username,
      roles: aivaRoles.map(role => role.toUpperCase()), // Convert all roles to uppercase
      givenName: tokenPayload.given_name,
      familyName: tokenPayload.family_name,
    };

    console.log(
      '🔍 SSO: Creating user profile with givenName:',
      profile.givenName,
      'from token given_name:',
      tokenPayload.given_name
    );

    return profile;
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
      const profile = profileStr ? JSON.parse(profileStr) : null;

      console.log('🔍 SSO: Getting user profile from localStorage, givenName:', profile?.givenName);

      return profile;
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
   * Create user account object for chat sessions from SSO profile and authority
   */
  public createUserAccount(profile: UserProfile, authority: string): UserAccount {
    // Get the current token to extract user ID from given_name
    const token = localStorage.getItem('ssoToken');
    let userId = undefined;
    let employeeId = undefined;

    if (token) {
      const payload = this.decodeToken(token);
      if (payload) {
        // Use 'given_name' field as the user ID (contains the actual user ID like "7780")
        userId = payload.given_name;
        employeeId = payload.given_name; // Employee ID is also the given_name
      }
    }

    return {
      id: userId,
      username: profile.username,
      name: profile.name,
      email: profile.email,
      authority: authority as Authority,
      roles: profile.roles,
      employee_id: employeeId,
      department: this.extractDepartmentFromRoles(profile.roles),
    };
  }

  /**
   * Get current user account for chat operations
   */
  public getCurrentUserAccount(): UserAccount | null {
    const authData = this.getAuthData();
    if (!authData.isAuthenticated || !authData.profile || !authData.authority) {
      return null;
    }

    return this.createUserAccount(authData.profile, authData.authority);
  }

  /**
   * Extract department information from user roles
   */
  private extractDepartmentFromRoles(roles: string[]): string | undefined {
    // Map common role patterns to departments
    const departmentMappings: Record<string, string> = {
      HUKUM: 'Legal Department',
      SDM: 'Human Resources Department',
      ADMIN: 'Administration Department',
      ALL: 'General Access',
    };

    // Find the first role that matches a department
    for (const role of roles) {
      const upperRole = role.toUpperCase();
      if (departmentMappings[upperRole]) {
        return departmentMappings[upperRole];
      }
    }

    return undefined;
  }
  public hasAuthority(requiredAuthority: string): boolean {
    const { authority } = this.getAuthData();
    return authority === requiredAuthority.toUpperCase();
  }

  /**
   * Check if user has any of the specified authorities/roles
   */
  public hasAnyAuthority(authorities: string[]): boolean {
    const profile = this.getUserProfile();
    if (!profile) return false;

    return authorities.some(auth => profile.roles.includes(auth.toUpperCase()));
  }
}

export default SSOService.getInstance();
