import jwt, { type SignOptions } from "jsonwebtoken";

export type JwtUserPayload = {
  uid: string;
  email: string;
};

const ACCESS_EXPIRES =
  (process.env.JWT_ACCESS_EXPIRES || "1h") as SignOptions["expiresIn"];
const REFRESH_EXPIRES =
  (process.env.JWT_REFRESH_EXPIRES || "90d") as SignOptions["expiresIn"];

function accessSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not defined");
  return s;
}

function refreshSecret(): string {
  const s = process.env.JWT_REFRESH_SECRET;
  if (s) return s;
  return `${accessSecret()}:refresh`;
}

export function signAccessToken(payload: JwtUserPayload): string {
  return jwt.sign(
    { uid: payload.uid, email: payload.email },
    accessSecret(),
    { expiresIn: ACCESS_EXPIRES } as SignOptions
  );
}

export function signRefreshToken(payload: JwtUserPayload): string {
  return jwt.sign(
    { uid: payload.uid, email: payload.email, typ: "refresh" },
    refreshSecret(),
    { expiresIn: REFRESH_EXPIRES } as SignOptions
  );
}

export function verifyRefreshToken(token: string): JwtUserPayload {
  const decoded = jwt.verify(token, refreshSecret()) as jwt.JwtPayload & {
    uid?: string;
    email?: string;
    typ?: string;
  };
  if (decoded.typ !== "refresh") {
    throw new Error("Invalid refresh token");
  }
  if (!decoded.uid || !decoded.email) {
    throw new Error("Invalid refresh payload");
  }
  return { uid: decoded.uid, email: decoded.email };
}
