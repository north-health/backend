import { Request, Response } from "express";
import admin, { auth, db } from "../../config/firebase/firebase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../models/user";

export class UserController {

  // EMAIL & PASSWORD LOGIN
  static async loginEmail(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // 1️⃣ GET USER FROM FIREBASE AUTH BY EMAIL
      let firebaseUser;
      try {
        firebaseUser = await auth.getUserByEmail(email);
      } catch {
        return res.status(404).json({ message: "User not found" });
      }

      // 2️⃣ GET USER DOCUMENT FROM FIRESTORE
      const userDoc = await db.collection("users").doc(firebaseUser.uid).get();
      if (!userDoc.exists) {
        return res.status(404).json({ message: "User data not found in Firestore" });
      }

      const userData = userDoc.data() as User;

      // 3️⃣ CHECK IF USER IS BLOCKED OR NOT VERIFIED
      if (userData.DTO.isBlocked) {
        return res.status(403).json({ message: "Account is blocked" });
      }

      // if (!userData.DTO.isVerfied) {
      //   return res.status(403).json({ message: "Account not verified" });
      // }

      // 4️⃣ COMPARE PASSWORD
      const isMatch = await bcrypt.compare(password, userData.password || "");
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // 5️⃣ GENERATE JWT TOKEN
      const token = jwt.sign(
        { uid: firebaseUser.uid, email: userData.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user: userData,
        uid: firebaseUser.uid
      });

    } catch (error) {
      console.error("❌ Email login error:", (error as Error).message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  // ENDS

  // GOOGLE LOGIN
  static async loginGoogle(req: Request, res: Response) {
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

      // CHECK IF USER EXISTS IN FIRESTORE
      const userDoc = await db.collection("users").doc(uid).get();

      if (userDoc.exists) {
        const userData = userDoc.data() as User;

        // CHECK IF USER IS BLOCKED
        if (userData.DTO.isBlocked) {
          return res.status(403).json({ message: "Account is blocked" });
        }

        // GENERATE JWT TOKEN
        const token = jwt.sign(
          { uid, email: userData.email },
          process.env.JWT_SECRET as string,
          { expiresIn: "7d" }
        );

        return res.status(200).json({
          message: "Google login successful",
          token,
          user: userData,
          uid
        });
      }

      // AUTO-REGISTER NEW GOOGLE USER
      const newUser: User = {
        id: undefined,
        email,
        displayName,
        identityNumber: "0000000000000",
        phoneNumber: "",
        province: "",
        city: "",
        role: "user",
        DTO: {
          isVerfied: true,
          isBlocked: false,
          isActive: true,
          isDeleted: false,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        hoursActive: 0,
      };

      await db.collection("users").doc(uid).set(newUser);

      // GENERATE JWT TOKEN
      const token = jwt.sign(
        { uid, email: newUser.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      return res.status(201).json({
        message: "Google user auto-registered and logged in",
        token,
        user: newUser,
        uid
      });

    } catch (error) {
      console.error("❌ Google login error:", (error as Error).message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}