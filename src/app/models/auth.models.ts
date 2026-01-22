export interface AuthSignInRequest {
  email: string;
  senha: string;
}

export interface AuthRegisterRequest {
  nome: string;
  email: string;
  senha: string;
  empresa: string;
}

export interface TokenResponse {
  email?: string;
  authenticated?: boolean;
  created?: string;
  expiration?: string;
  accessToken?: string;
  refreshToken?: string;
}
