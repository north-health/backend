import { Request, Response } from "express";
import admin, { auth, db } from "../../config/firebase/firebase";
import { User } from "../../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// INIT DTO VALUES
function createDefaultDTO() {
  return {
    isVerfied: false,
    isBlocked: false,
    isActive: true,
    isDeleted: false,
  };
}
// ENDS

export class UserController {
  // REGISTER WITH EMAIL & PASSWORD
  static async registerEmail(req: Request, res: Response) {
    try {
      const { email, password, displayName, identityNumber } = req.body;

      // 1️⃣VALIDATION
      if (!email || !password || !displayName || !identityNumber) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (!/^\d{13}$/.test(identityNumber)) {
        return res
          .status(400)
          .json({ message: "Identity number must be 13 digits" });
      }
      //   ENDS

      // 2️⃣ USER EXISTS ?
      try {
        const existingUser = await auth.getUserByEmail(email);
        return res
          .status(400)
          .json({ message: "Email already registered", user: existingUser });
      } catch {
        // PROCEED TO REGISTER
      }

      // 3️⃣ HASH PASSWORD
      const hashedPassword = await bcrypt.hash(password, 10);

      // 4️⃣ CREATE USER IN FIREBASE AUTH
      const firebaseUser = await auth.createUser({
        email,
        password: hashedPassword,
        displayName,
      });

      // 5️⃣ CREATE USER DOCUMENT IN FIRESTORE
      const userData: User = {
        id: undefined,
        email,
        password: hashedPassword,
        displayName,
        identityNumber,
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

      // 6️⃣ GENERATE JWT TOKEN
      const token = jwt.sign(
        { uid: firebaseUser.uid, email: userData.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      return res.status(201).json({
        message: "User registered successfully",
        token,
        user: userData,
      });
    } catch (error) {
      console.error("❌ Register email error:", (error as Error).message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  
  // REGISTER WITH GOOGLE
  static async registerGoogle(req: Request, res: Response) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Google ID token is required" });
    }

    // VERIFY ID TOKEN WITH FIREBASE AUTH
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email || "";
    const displayName = decodedToken.name || "No Name";

    // Check if user exists
    const userDoc = await db.collection("users").doc(uid).get();
    if (userDoc.exists) {
      return res.status(400).json({
        message: "User already registered with Google",
        user: userDoc.data(),
      });
    }

    // CREATE NEW USER DOCUMENT IN FIRESTORE
    const userData: User = {
      id: undefined,
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

    // GENERATE JWT TOKEN
    const token = jwt.sign(
      { uid, email: userData.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User registered successfully with Google",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("❌ Register Google error:", (error as Error).message);
    return res.status(500).json({ message: "Internal server error" });
  }
}}
// ENDS