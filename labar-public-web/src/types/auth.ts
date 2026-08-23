export interface AuthUser {
  id: string;
  phone: string;
  display_name?: string;
  locale?: string;
  roles?: string[];
}

export interface OtpChallenge {
  challenge_id: string;
  expires_at: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}
