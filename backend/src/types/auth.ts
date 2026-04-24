export interface JwtUserPayload {
  userId?: number;
  username: string;
  isLocalAdmin?: boolean;
}
