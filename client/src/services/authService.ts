const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const buildApiUrl = (path: string): string => `${API_BASE_URL}${path}`;

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface UpdateProfileData {
  username?: string;
  email?: string;
  password?: string;
  remove_avatar?: boolean;
}

interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    is_moderator: boolean;
    avatar_url?: string;
  };
}

interface MeResponse {
  user: {
    id: number;
    username: string;
    email: string;
    is_moderator: boolean;
    avatar_url?: string;
  };
}

interface RefreshResponse {
  access: string;
  refresh: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(buildApiUrl('/api/auth/login/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || 'Invalid credentials');
    }

    return response.json();
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(buildApiUrl('/api/auth/register/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || 'Registration failed');
    }

    return response.json();
  }

  async fetchCurrentUser(): Promise<MeResponse> {
    const response = await this.authFetch('/api/auth/me/', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch current user');
    }

    return response.json();
  }

  async updateProfile(data: UpdateProfileData | FormData): Promise<MeResponse> {
    const isFormData = data instanceof FormData;
    const response = await this.authFetch('/api/auth/me/update/', {
      method: 'PUT',
      headers: isFormData ? {} : {
        'Content-Type': 'application/json',
      },
      body: isFormData ? data : JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || 'Profile update failed');
    }

    return response.json();
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('avatarUrl');
    localStorage.removeItem('isModerator');
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  setUsername(username: string): void {
    localStorage.setItem('username', username);
  }

  setEmail(email: string): void {
    localStorage.setItem('email', email);
  }

  setAvatarUrl(avatarUrl: string): void {
    localStorage.setItem('avatarUrl', avatarUrl);
  }

  setIsModerator(isModerator: boolean): void {
    localStorage.setItem('isModerator', String(isModerator));
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getEmail(): string | null {
    return localStorage.getItem('email');
  }

  getAvatarUrl(): string | null {
    return localStorage.getItem('avatarUrl');
  }

  isModerator(): boolean {
    return localStorage.getItem('isModerator') === 'true';
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return Boolean(this.getAccessToken());
  }

  private async refreshTokens(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await fetch(buildApiUrl('/api/auth/refresh/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      this.logout();
      throw new Error('Token refresh failed');
    }

    const payload = await response.json() as RefreshResponse;
    this.setTokens(payload.access, payload.refresh || refreshToken);
  }

  async authFetch(path: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers || {});
    const accessToken = this.getAccessToken();
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    let response = await fetch(buildApiUrl(path), {
      ...init,
      headers,
    });

    if (response.status !== 401 || !this.getRefreshToken()) {
      return response;
    }

    await this.refreshTokens();

    const retryHeaders = new Headers(init.headers || {});
    const newAccessToken = this.getAccessToken();
    if (newAccessToken) {
      retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);
    }

    response = await fetch(buildApiUrl(path), {
      ...init,
      headers: retryHeaders,
    });
    return response;
  }
}

export default new AuthService();
