export interface LoginDto {
  email: string;
  password: string;
}

/** شكل الـ data داخل { success, message, data: AuthResponseData } */
export interface AuthResponseData {
  id: number;
  username: string;
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: string;
}

/** AuthUser المحفوظ في localStorage بعد اللوجين */
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
}
