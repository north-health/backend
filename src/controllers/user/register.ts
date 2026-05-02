import { Request, Response } from "express";
import { auth, db } from "../../config/firebase/firebase";
import { User } from "../../models/user";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "../../utils/jwtPair";

// INIT DTO VALUES
function createDefaultDTO() {
  return {
    isVerfied: false,
    isBlocked: false,
    isActive: true,
    isDeleted: false,
  };
}

// ==============================
// REGISTER WITH EMAIL & PASSWORD
// ==============================
export const registerEmail = async (req: Request, res: Response) => {
  try {
    const { email, password, displayName, identityNumber } = req.body;

    if (!email || !password || !displayName) {
      return res
        .status(400)
        .json({ message: "Email, password, and display name are required" });
    }

    const rawId =
      identityNumber != null ? String(identityNumber).trim() : "";
    const resolvedIdentity =
      rawId.length > 0 ? rawId : "0000000000000";

    if (!/^\d{13}$/.test(resolvedIdentity)) {
      return res
        .status(400)
        .json({ message: "Identity number must be 13 digits when provided" });
    }

    // 2️⃣ CHECK IF USER EXISTS
    try {
      const existingUser = await auth.getUserByEmail(email);
      return res.status(400).json({
        message: "Email already registered",
        user: existingUser,
      });
    } catch {
      // User does not exist → continue
    }

    // 3️⃣ CREATE USER IN FIREBASE AUTH (USE PLAIN PASSWORD)
    const firebaseUser = await auth.createUser({
      email,
      password,
      displayName,
    });

    // 4️⃣ HASH PASSWORD FOR STORAGE
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ CREATE USER DOCUMENT IN FIRESTORE
    const userData: User = {
      email,
      password: hashedPassword, // I WILL COME BACK TO REVIEW THIS DECISION
      displayName,
      identityNumber: resolvedIdentity,
      phoneNumber: "",
      province: "",
      city: "",
      role: "user",
      DTO: createDefaultDTO(),
      createdAt: new Date(),
      updatedAt: new Date(),
      hoursActive: 0,
    };

    await db.collection("users").doc(firebaseUser.uid).set(userData);

    // 6️⃣ GENERATE TOKENS
    const token = signAccessToken({
      uid: firebaseUser.uid,
      email: userData.email,
    });
    const refreshToken = signRefreshToken({
      uid: firebaseUser.uid,
      email: userData.email,
    });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      refreshToken,
      user: userData,
      uid: firebaseUser.uid,
    });
  } catch (error) {
    console.error("❌ Register email error:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

// ==============================
// REGISTER WITH GOOGLE
// ==============================
export const registerGoogle = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res
        .status(400)
        .json({ message: "Google ID token is required" });
    }

    // VERIFY TOKEN
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email || "";
    const displayName = decodedToken.name || "No Name";

    // CHECK IF USER EXISTS
    const userDoc = await db.collection("users").doc(uid).get();
    if (userDoc.exists) {
      return res.status(400).json({
        message: "User already registered with Google",
        user: userDoc.data(),
      });
    }

    // CREATE USER DOCUMENT
    const userData: User = {
      email,
      displayName,
      identityNumber: "0000000000000",
      phoneNumber: "",
      province: "",
      city: "",
      role: "user",
      DTO: createDefaultDTO(),
      createdAt: new Date(),
      updatedAt: new Date(),
      hoursActive: 0,
    };

    await db.collection("users").doc(uid).set(userData);

    // GENERATE TOKENS
    const token = signAccessToken({ uid, email: userData.email });
    const refreshToken = signRefreshToken({ uid, email: userData.email });

    return res.status(201).json({
      message: "User registered successfully with Google",
      token,
      refreshToken,
      user: userData,
      uid
    });
  } catch (error) {
    console.error("❌ Register Google error:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};