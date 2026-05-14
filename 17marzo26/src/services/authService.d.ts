export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      email: string;
    };
    csrfToken: string;
    expiresIn: string;
  };
}

export interface VerifyResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      email: string;
      apiKey: string;
    };
  };
}

export interface AuthService {
  login(email: string): Promise<LoginResponse>;
  logout(): Promise<any>;
  verify(): Promise<VerifyResponse>;
  isAuthenticated(): boolean;
  getUserEmail(): string | null;
}

export const authService: AuthService;
export const apiClient: any;
