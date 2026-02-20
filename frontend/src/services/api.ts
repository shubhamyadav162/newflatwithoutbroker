// API Configuration
const getBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (!envUrl) return '/api/v1';

    // If it's a full URL and doesn't end with /api/v1, append it
    if (envUrl.startsWith('http')) {
        return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl.replace(/\/$/, '')}/api/v1`;
    }

    return envUrl;
};

const API_BASE_URL = getBaseUrl();

// Types
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// Token management
let accessToken: string | null = localStorage.getItem('accessToken');
let adminPassword: string | null = sessionStorage.getItem('adminPassword');

export const setAccessToken = (token: string | null) => {
    accessToken = token;
    if (token) {
        localStorage.setItem('accessToken', token);
    } else {
        localStorage.removeItem('accessToken');
    }
};

export const getAccessToken = () => accessToken;

export const setAdminPassword = (password: string | null) => {
    adminPassword = password;
    if (password) {
        sessionStorage.setItem('adminPassword', password);
    } else {
        sessionStorage.removeItem('adminPassword');
    }
};

export const getAdminPassword = () => adminPassword;

// API Client
class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        isRetry = false
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers: HeadersInit = {
            ...options.headers,
        };

        // Only set Content-Type to application/json if not sending FormData
        if (!(options.body instanceof FormData)) {
            (headers as Record<string, string>)['Content-Type'] = 'application/json';
        }

        // Add authorization header for user requests
        if (accessToken) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
        }

        // Add admin password header for admin API requests
        if (adminPassword && endpoint.startsWith('/admin')) {
            (headers as Record<string, string>)['x-admin-password'] = adminPassword;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            // Handle 401 Unauthorized
            if (response.status === 401) {
                const refreshToken = localStorage.getItem('refreshToken');

                // If we have a refresh token and haven't retried yet, try to refresh
                if (refreshToken && !isRetry) {
                    try {
                        const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ refreshToken }),
                        });

                        if (refreshResponse.ok) {
                            const refreshData = await refreshResponse.json();
                            const newAccessToken = refreshData.data.accessToken;

                            // Store new token
                            setAccessToken(newAccessToken);

                            // Retry the original request
                            return this.request<T>(endpoint, options, true);
                        }
                    } catch (refreshError) {
                        console.error('Failed to refresh token:', refreshError);
                    }
                }

                // If refresh failed or no refresh token, log out
                setAccessToken(null);
                localStorage.removeItem('user');
                localStorage.removeItem('refreshToken');

                // Only redirect if not on admin pages and not specifically checking auth
                if (!window.location.pathname.startsWith('/admin') && endpoint !== '/auth/me') {
                    window.location.href = '/login';
                }
                throw new Error('Session expired. Please login again.');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
        });
    }

    async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
        });
    }

    async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
        });
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export const api = new ApiClient(API_BASE_URL);
export default api;

