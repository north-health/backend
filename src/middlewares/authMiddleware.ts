import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../config/firebase/firebase";
import { User } from "../models/user";

// EXTEND EXPRESS REQUEST TO INCLUDE USER
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
// ENDS

// VERIFY JWT
export const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // DECODE JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    const uid = decoded.uid;

    // FETCH USER FROM FIRESTORE
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = userDoc.data() as User;

    // CHECK IF USER IS BLOCKED OR DELETED
    if (userData.DTO.isBlocked) {
      return res.status(403).json({ message: "Account is blocked" });
    }

    if (userData.DTO.isDeleted) {
      return res.status(403).json({ message: "Account is deleted" });
    }

    // ATTACH USER TO REQUEST
    req.user = {
      ...userData,
      id: uid,
      email: userData.email,
      displayName: userData.displayName || undefined,
      identityNumber: userData.identityNumber,
      role: userData.role || "user",
      DTO: userData.DTO || {
        isVerfied: false,
        isBlocked: false,
        isActive: true,
        isDeleted: false,
      },
      hoursActive: userData.hoursActive || 0,
      createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
      updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date(),
    };

    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
// ENDS

// ROLE-BASED AUTHORIZATION
export const authorizeRole = (...roles: ("user" | "admin")[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role || "user")) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};
// ENDS