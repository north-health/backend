import { Request, Response } from "express";
import { db } from "../../config/firebase/firebase";
import { User } from "../../models/user";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwtPair";

export async function refreshTokens(req: Request, res: Response) {
  try {
    const refreshToken = req.body?.refreshToken;

    if (!refreshToken || typeof refreshToken !== "string") {
      return res.status(400).json({ message: "refreshToken is required" });
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken.trim());
    } catch {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const userDoc = await db.collection("users").doc(payload.uid).get();
    if (!userDoc.exists) {
      return res.status(401).json({ message: "User not found" });
    }

    const userData = userDoc.data() as User;

    if (userData.DTO?.isBlocked) {
      return res.status(403).json({ message: "Account is blocked" });
    }

    if (userData.DTO?.isDeleted) {
      return res.status(403).json({ message: "Account is no longer available" });
    }

    const email = userData.email || payload.email;

    const token = signAccessToken({ uid: payload.uid, email });
    const newRefresh = signRefreshToken({ uid: payload.uid, email });

    return res.status(200).json({
      message: "Token refreshed",
      token,
      refreshToken: newRefresh,
      user: userData,
      uid: payload.uid,
    });
  } catch (error) {
    console.error("❌ Refresh error:", (error as Error).message);
    return res.status(500).json({ message: "Internal server error" });
  }
}
